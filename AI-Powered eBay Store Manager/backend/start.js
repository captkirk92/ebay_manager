const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

function getPortFromConfig() {
  try {
    const configPath = path.join(__dirname, '../.env.development');
    const config = fs.readFileSync(configPath, 'utf8');
    const portMatch = config.match(/BACKEND_PORT=(\d+)/);
    return portMatch ? parseInt(portMatch[1]) : 5001;
  } catch (error) {
    console.warn('Could not read port from config:', error);
    return 5001;
  }
}

function startServer() {
  // First, run the port manager to ensure we have an available port
  const portManagerProcess = spawn('python3', ['../utils/port_manager.py']);
  
  portManagerProcess.stdout.on('data', (data) => {
    console.log(`Port Manager: ${data}`);
  });

  portManagerProcess.stderr.on('data', (data) => {
    console.error(`Port Manager Error: ${data}`);
  });

  portManagerProcess.on('close', (code) => {
    if (code === 0) {
      // Port manager completed successfully, now start the server
      const port = getPortFromConfig();
      const app = require('./server');
      app.listen(port, () => {
        console.log(`🚀 Server running on port ${port}`);
      });
    } else {
      console.error(`Port manager exited with code ${code}`);
      process.exit(1);
    }
  });
}

// Handle cleanup on shutdown
process.on('SIGINT', () => {
  console.log('\nGracefully shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nGracefully shutting down...');
  process.exit(0);
});

startServer();
