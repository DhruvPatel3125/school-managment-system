const express = require('express');
const router = express.Router();
const { sequelize } = require('../config/db');

router.get('/health', async (req, res) => {
  try {
    // Check database connectivity
    await sequelize.authenticate();
    
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
