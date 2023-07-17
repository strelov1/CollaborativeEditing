import { optimisticDelete, optimisticUpdate } from "./strategy/optimistic";
import { pessimisticDelete, pessimisticUpdate } from "./strategy/pessimistic";

type Strategy = 'optimistic' | 'pessimistic';
export const buildUpdateFunction = (strategy: Strategy) => {
  switch (strategy) {
    case "optimistic":
      return optimisticUpdate;
    case "pessimistic":
      return pessimisticUpdate;
    default:
      throw new Error(`Unknown strategy: ${strategy}`);
  }
};

export const buildDeleteFunction = (strategy: Strategy) => {
  switch (strategy) {
    case "optimistic":
      return optimisticDelete;
    case "pessimistic":
      return pessimisticDelete;
    default:
      throw new Error(`Unknown strategy: ${strategy}`);
  }
};
