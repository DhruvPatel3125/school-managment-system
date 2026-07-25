const logger = require('../utils/logger');
const mongoose = require('mongoose');

let isConnected = false;

/**
 * Connects to MongoDB using the MONGODB_URI environment variable.
 * Supports caching connection across serverless function invocations.
 */
const connectDB = async () => {
  if (mongoose.connection.readyState === 1 || isConnected) {
    return mongoose.connection;
  }

  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in the environment variables.');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    logger.info(`✅ MongoDB Connection Successful: Connected to host "${conn.connection.host}"`);
    return conn;
  } catch (error) {
    logger.error('❌ MongoDB Connection Failed:', error.message);
    if (process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME) {
      throw error;
    }
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  mongoose
};
