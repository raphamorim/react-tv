expect.extend({
  toRunSuccessfully(received) {
    const pass = received.status === 0;

    if (pass) {
      return {
        message: () => `expected exit code not to be 0`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected exit code to be 0, was ${received.status} with error: \n${
            received.output
          }`,
        pass: false,
      };
    }
  },
});
