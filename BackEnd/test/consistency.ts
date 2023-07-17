import { assert } from "chai";
import { addNodeExclusive, removeNodeExclusive } from "../src/handlers/node";
import { getNodes } from "../src/components/node/node.service";

const serrilize = (obj: any) => JSON.parse(JSON.stringify(obj));

describe("consistency", () => {
  it("adding and delete nodes", async () => {
    const firstNode = await addNodeExclusive(null);
    const secondNode = await addNodeExclusive(firstNode.createdNode.id);
    const thirdNode = await addNodeExclusive(secondNode.createdNode.id);
    const fourthNode = await addNodeExclusive(thirdNode.createdNode.id);

    await Promise.allSettled([
      removeNodeExclusive(secondNode.createdNode.id),
      removeNodeExclusive(thirdNode.createdNode.id),
    ]);

    const nodes = await getNodes();

    assert.equal(nodes.nodes.length, 2);

    const serializedNodes = serrilize(nodes.nodes);

    const expectedNodes = [
      {
        id: firstNode.createdNode.id,
        next: fourthNode.createdNode.id,
        prev: null,
      },
      {
        id: fourthNode.createdNode.id,
        prev: firstNode.createdNode.id,
        next: null,
      }
    ];

    assert.includeDeepMembers(expectedNodes, serializedNodes)

  });
});
