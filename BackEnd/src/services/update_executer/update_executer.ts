import mongoose from "mongoose";
import Node from "../../components/node/node.model";
import { NodeId } from "./types";
import { ERROR_CONFLICT_UPDATE, ERROR_NODE_DELETED } from "./const";
import { IUpdatedNodes } from "../../models/SocketData";

export const updateNodes = async (
  prevNodeId: NodeId,
  createdNode: any,
  updatedNodes: IUpdatedNodes
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const prevNode = await Node.findById(prevNodeId).session(session);
    if (!prevNode) {
      throw new Error(ERROR_NODE_DELETED);
    }

    createdNode.prev = prevNode.id;
    updatedNodes[prevNode.id] = { next: createdNode.id };

    await Node.bulkWrite([
      {
        updateOne: {
          filter: { _id: prevNode.id },
          update: { $set: { next: createdNode.id } }
        }
      },
      {
        updateOne: {
          filter: { _id: prevNode.next },
          update: { $set: { prev: createdNode.id } }
        }
      }
    ], { session });

    if (prevNode.next) {
      createdNode.next = prevNode.next;
      updatedNodes[prevNode.next.toString()] = { prev: createdNode.id };
    }

    await createdNode.save({ session });
    await session.commitTransaction();
  } catch (e) {
    await session.abortTransaction();
    throw new Error(ERROR_CONFLICT_UPDATE);
  } finally {
    await session.endSession();
  }
};

export const deleteNodes = async (
  nodeId: NodeId,
  updatedNodes: IUpdatedNodes
) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const deletedNode = await Node.findById(nodeId).session(session);
    if (!deletedNode) {
      throw new Error(ERROR_NODE_DELETED);
    }

    await Node.findByIdAndDelete(nodeId).session(session);

    await Node.bulkWrite([
      {
        updateOne: {
          filter: { _id: deletedNode.prev },
          update: { $set: { next: deletedNode.next } }
        }
      },
      {
        updateOne: {
          filter: { _id: deletedNode.next },
          update: { $set: { prev: deletedNode.prev } }
        }
      }
    ], { session });

    if (deletedNode.prev && deletedNode.next) {
      updatedNodes[deletedNode.prev.toString()] = { next: deletedNode.next.toString() };
      updatedNodes[deletedNode.next.toString()] = { prev: deletedNode.prev.toString() };
    } else if (deletedNode.prev) {
      updatedNodes[deletedNode.prev.toString()] = { next: null };
    } else if (deletedNode.next) {
      updatedNodes[deletedNode.next.toString()] = { prev: null };
    }
    await session.commitTransaction();
  } catch (e) {
    await session.abortTransaction();
    throw new Error(ERROR_CONFLICT_UPDATE);
  } finally {
    await session.endSession();
  }
};
