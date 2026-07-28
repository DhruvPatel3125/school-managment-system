const app = require('../server/src/app');
const { connectDB } = require('../server/src/config/db');

module.exports = async (req, res) => {
  // Ensure DB connection is active before handling requests
  // The connectDB function already checks if a connection is established and caches it
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to MongoDB in Vercel serverless function:', err);
    return res.status(500).json({ error: 'Database connection failed' });
  }

  // Delegate the request to the Express app
  return app(req, res);
};
