const express = require('express');
const cors = require('cors');
const path = require('path');
const { spawn } = require('child_process');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, '../build')));

// eBay API integration endpoints
app.get('/api/store/summary', async (req, res) => {
  try {
    const pythonProcess = spawn('python3', ['../ebay_api_client.py', '--summary']);
    let data = '';
    
    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(data);
          res.json(result);
        } catch (parseError) {
          res.status(500).json({ error: 'Failed to parse eBay API response' });
        }
      } else {
        res.status(500).json({ error: 'eBay API request failed' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/store/orders', async (req, res) => {
  try {
    const daysBack = req.query.days || 30;
    const pythonProcess = spawn('python3', ['../ebay_api_client.py', '--orders', daysBack]);
    let data = '';
    
    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(data);
          res.json(result);
        } catch (parseError) {
          res.status(500).json({ error: 'Failed to parse eBay API response' });
        }
      } else {
        res.status(500).json({ error: 'eBay API request failed' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/store/listings', async (req, res) => {
  try {
    const pythonProcess = spawn('python3', ['../ebay_api_client.py', '--listings']);
    let data = '';
    
    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(data);
          res.json(result);
        } catch (parseError) {
          res.status(500).json({ error: 'Failed to parse eBay API response' });
        }
      } else {
        res.status(500).json({ error: 'eBay API request failed' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/store/analytics', async (req, res) => {
  try {
    const daysBack = req.query.days || 30;
    const pythonProcess = spawn('python3', ['../ebay_api_client.py', '--analytics', daysBack]);
    let data = '';
    
    pythonProcess.stdout.on('data', (chunk) => {
      data += chunk.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(data);
          res.json(result);
        } catch (parseError) {
          res.status(500).json({ error: 'Failed to parse eBay API response' });
        }
      } else {
        res.status(500).json({ error: 'eBay API request failed' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 eBay Store Manager API server running on port ${PORT}`);
  console.log(`📊 Dashboard available at http://localhost:${PORT}`);
});
