import { assert } from "chai";
import Node from "../src/components/node/node.model";
import { addNodeExclusive } from "../src/handlers/node";

describe("add nodes", () => {
  it("add node with parent", async () => {
    const firstNode = new Node();
    await firstNode.save();

    const result = await addNodeExclusive(firstNode.id);

    assert.deepEqual(result.updatedNodes, {
      [firstNode.id]: {
        next: result.createdNode.id
      },
    });
  });

  it("add node without parent", async () => {
    const result = await addNodeExclusive(null);

    assert.deepEqual(result.updatedNodes, {});
  });

  it("add node seq", async () => {
    const x = await addNodeExclusive(null);
    const y = await addNodeExclusive(x.createdNode.id);
    const z = await addNodeExclusive(y.createdNode.id);

    assert.deepEqual(x.updatedNodes, {});

    assert.deepEqual(y.updatedNodes, {
      [x.createdNode.id]: {
        next: y.createdNode.id,
      },
    });

    assert.deepEqual(z.updatedNodes, {
      [y.createdNode.id]: {
        next: z.createdNode.id,
      },
    });
  });

  it("add node between", async () => {
    const x = await addNodeExclusive(null);
    const z = await addNodeExclusive(x.createdNode.id);

    const y = await addNodeExclusive(x.createdNode.id);

    assert.deepEqual(y.updatedNodes, {
      [x.createdNode.id]: {
        next: y.createdNode.id,
      },
      [z.createdNode.id]: {
        prev: y.createdNode.id,
      },
    });
  });

  it("add multiply nodes", async () => {
    const w = await addNodeExclusive(null);
    const x = await addNodeExclusive(w.createdNode.id);
    const y = await addNodeExclusive(x.createdNode.id);
    const z = await addNodeExclusive(y.createdNode.id);

    const result = await Promise.all([
      addNodeExclusive(w.createdNode.id),
      addNodeExclusive(y.createdNode.id)
    ]);

    const firstResult = result[0];
    const secondResult = result[1];

    assert.deepEqual(firstResult.updatedNodes, {
      [w.createdNode.id]: {
        next: firstResult.createdNode.id
      },
      [x.createdNode.id]: {
        prev: firstResult.createdNode.id,
      }
    });

    assert.deepEqual(secondResult.updatedNodes, {
      [y.createdNode.id]: {
        next: secondResult.createdNode.id
      },
      [z.createdNode.id]: {
        prev: secondResult.createdNode.id,
      },
    });
  });
});
