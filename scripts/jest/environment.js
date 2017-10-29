// For testing DOM Fiber.
global.requestAnimationFrame = function(callback) {
  setTimeout(callback);
};

global.requestIdleCallback = function(callback) {
  setTimeout(() => {
    callback({
      timeRemaining() {
        return Infinity;
      },
    });
  });
};
