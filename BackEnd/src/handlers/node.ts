import Node from "../components/node/node.model";
import { IUpdatedNodes } from "../models/SocketData";
import { ERROR_CONFLICT_UPDATE } from "../services/update_executer/const";
import { retryExecute } from "../services/update_executer/utils";
import { updateNodes, deleteNodes } from "../services/update_executer/update_executer";

export const RETRY_ITERATION = 3;

export const addNodeExclusive = async (prevNodeId: string | null) => {
  const updatedNodes: IUpdatedNodes = {};
  const createdNode = new Node();

  // Node without parent
  if (!prevNodeId) {
    await createdNode.save();
    return { createdNode, updatedNodes };
  }

  await retryExecute(async () => {
    await updateNodes(prevNodeId, createdNode, updatedNodes);
  }, ERROR_CONFLICT_UPDATE, RETRY_ITERATION);

  return { createdNode, updatedNodes };
};

export const removeNodeExclusive = async (nodeId: string) => {
  const updatedNodes: IUpdatedNodes = {};

  await retryExecute(async () => {
    await deleteNodes(nodeId, updatedNodes);
  }, ERROR_CONFLICT_UPDATE, RETRY_ITERATION);

  return {
    deletedNodeId: nodeId,
    updatedNodes
  };
};
