import { assert } from "chai";
import Node from "../src/components/node/node.model";
import { addNodeExclusive, removeNodeExclusive } from "../src/handlers/node";

describe("delete nodes", () => {
  it("delete node without parent", async () => {
    const firstNode = new Node();
    await firstNode.save();

    const result = await removeNodeExclusive(firstNode.id);
    assert.deepEqual(result.deletedNodeId, firstNode.id);
    assert.deepEqual(result.updatedNodes, {});
  });

  it("delete node with prev", async () => {
    const firstNode = new Node();
    await firstNode.save();

    const secondNode = await addNodeExclusive(firstNode.id);

    const result = await removeNodeExclusive(secondNode.createdNode.id);

    assert.deepEqual(result.deletedNodeId, secondNode.createdNode.id);
    assert.deepEqual(result.updatedNodes, {
      [firstNode.id]: {
        next: null
      }
    });
  });

  it("delete with next", async () => {
    const firstNode = new Node();
    await firstNode.save();

    const secondNode = await addNodeExclusive(firstNode.id);

    const result = await removeNodeExclusive(firstNode.id);

    assert.deepEqual(result.deletedNodeId, firstNode.id);
    assert.deepEqual(result.updatedNodes, {
      [secondNode.createdNode.id]: {
        prev: null
      }
    });
  });

  it("delete node between", async () => {
    const x = await addNodeExclusive(null);
    const y = await addNodeExclusive(x.createdNode.id);
    const z = await addNodeExclusive(y.createdNode.id);

    const result = await removeNodeExclusive(y.createdNode.id);

    assert.deepEqual(result.deletedNodeId, y.createdNode.id);
    assert.deepEqual(result.updatedNodes, {
      [x.createdNode.id]: {
        next: z.createdNode.id
      },
      [z.createdNode.id]: {
        prev: x.createdNode.id
      }
    });
  });
});
