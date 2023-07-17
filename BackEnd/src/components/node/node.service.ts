import { IUpdatedNodes } from "../../models/SocketData";
import Node, { INode } from "./node.model";

export async function getNodes() {
  try {
    const nodes = await Node.find({});

    return {
      nodes
    };
  } catch (err) {
    console.error(err);
  }
}
