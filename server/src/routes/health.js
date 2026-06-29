const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

router.get('/health', async (req, res) => {
  try {
    // Check database connectivity (readyState 1 indicates connected)
    const isDbConnected = mongoose.connection.readyState === 1;
    if (!isDbConnected) {
      throw new Error('MongoDB connection is not established.');
    }
    
    res.status(200).json({
      success: true,
      status: 'UP',
      timestamp: new Date(),
      services: {
        database: 'connected',
        server: 'healthy'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'DOWN',
      timestamp: new Date(),
      services: {
        database: 'disconnected',
        server: 'healthy'
      },
      error: error.message
    });
  }
});

module.exports = router;
