// eslint-disable-next-line no-promise-executor-return
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const retryExecute = async (fn, errorToSkip, maxAttempts) => {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      // eslint-disable-next-line no-await-in-loop
      return await fn();
    } catch (error) {
      if (error.message === errorToSkip) {
        console.log(`Attempt ${i + 1} failed with Error: ${error.message} | Retrying...`);
        if (i === maxAttempts - 1) {
          throw error;
        }
      } else {
        console.log('Error', error.message);
        throw error;
      }
    }
  }
};
