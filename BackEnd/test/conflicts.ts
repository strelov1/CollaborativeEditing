import { assert } from "chai";
import Node from "../src/components/node/node.model";
import { addNodeExclusive, removeNodeExclusive } from "../src/handlers/node";
import { ERROR_CONFLICT_UPDATE, ERROR_NODE_DELETED } from "../src/services/update_executer/const";

describe("conflicting updates test", () => {
  it("add two nodes for one prev", async () => {
    const firstNode = new Node();
    await firstNode.save();

    const result = await Promise.all([
      addNodeExclusive(firstNode.id),
      addNodeExclusive(firstNode.id)
    ]);

    const firstResult = result[0];
    const secondResult = result[1];

    const expectedCombinationFirstResult = [
      {
        [firstNode.id]: {
          next: firstResult.createdNode.id
        },
      },
      {
        [firstNode.id]: {
          next: firstResult.createdNode.id
        },
        [secondResult.createdNode.id]: {
          prev: firstResult.createdNode.id
        },
      },
    ];

    const expectedCombinationSecondResult = [
      {
        [firstNode.id]: {
          next: secondResult.createdNode.id
        },
      },
      {
        [firstNode.id]: {
          next: secondResult.createdNode.id
        },
        [firstResult.createdNode.id]: {
          prev: secondResult.createdNode.id
        },
      }
    ];

    assert.includeDeepMembers(expectedCombinationFirstResult, [firstResult.updatedNodes] as any);
    assert.includeDeepMembers(expectedCombinationSecondResult, [secondResult.updatedNodes] as any);
  });

  it("add two nodes between", async () => {
    const firstNode = new Node();
    await firstNode.save();

    const secondNode = await addNodeExclusive(firstNode.id);

    const result = await Promise.all([
      addNodeExclusive(firstNode.id),
      addNodeExclusive(firstNode.id)
    ]);

    const firstResult = result[0];
    const secondResult = result[1];

    const expectedCombinationFirstResult = [
      {
        [firstNode.id]: {
          next: firstResult.createdNode.id
        },
        [secondNode.createdNode.id]: {
          prev: firstResult.createdNode.id
        },
      },
      {
        [firstNode.id]: {
          next: firstResult.createdNode.id
        },
        [secondResult.createdNode.id]: {
          prev: firstResult.createdNode.id
        },
      },
    ];

    const expectedCombinationSecondResult = [
      {
        [firstNode.id]: {
          next: secondResult.createdNode.id
        },
        [secondNode.createdNode.id]: {
          prev: secondResult.createdNode.id
        },
      },
      {
        [firstNode.id]: {
          next: secondResult.createdNode.id
        },
        [firstResult.createdNode.id]: {
          prev: secondResult.createdNode.id
        },
      },
    ];

    assert.includeDeepMembers(expectedCombinationFirstResult, [firstResult.updatedNodes] as any);
    assert.includeDeepMembers(expectedCombinationSecondResult, [secondResult.updatedNodes] as any);
  });

  it("add node for deleted prev", async () => {
    const firstNode = new Node();
    await firstNode.save();

    const result = await Promise.allSettled([
      removeNodeExclusive(firstNode.id),
      addNodeExclusive(firstNode.id)
    ]);

    const deleteResult = result[0];
    const updateResult = result[1];

    assert.include(
      [
        // Delete first, update is failed cause node already deleted
        deleteResult.status === "fulfilled" && (updateResult.status === "rejected" && updateResult.reason.message === ERROR_NODE_DELETED),
        // Create First, and delete second success
        deleteResult.status === "fulfilled" && updateResult.status === "fulfilled" && firstNode.id in updateResult.value.updatedNodes,
        // Delete second, and failed cause of mutual conflict (pessimistic lock)
        deleteResult.status === "fulfilled" && (updateResult.status === "rejected" && updateResult.reason.message === ERROR_CONFLICT_UPDATE),
      ],
      true
    );

    // assert.ok(result[0].status === "fulfilled" && (result[1].status === "rejected" && result[1].reason.message === "Node deleted"));
  });
});
