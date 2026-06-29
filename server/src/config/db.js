const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the MONGODB_URI environment variable.
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in the environment variables.');
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connection Successful: Connected to host "${conn.connection.host}"`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1); // Exit server process if DB connection fails
  }
};

module.exports = {
  connectDB,
  mongoose
};
