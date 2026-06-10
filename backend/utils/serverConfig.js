function getPortCandidates(startPort = 8080) {
  return Array.from({ length: 4 }, (_, index) => startPort + index);
}

function listenWithFallback(app, startPort = 8080) {
  return new Promise((resolve, reject) => {
    const ports = getPortCandidates(startPort);

    const tryListen = (index) => {
      const port = ports[index];
      const server = app.listen(port, '0.0.0.0', () => {
        console.log(`Server running on port ${port}`);
        resolve(server);
      });

      server.on('error', (error) => {
        if (error.code === 'EADDRINUSE' && index < ports.length - 1) {
          console.warn(`Port ${port} is already in use. Trying ${ports[index + 1]} instead.`);
          server.close(() => tryListen(index + 1));
          return;
        }

        reject(error);
      });
    };

    tryListen(0);
  });
}

module.exports = {
  getPortCandidates,
  listenWithFallback,
};
