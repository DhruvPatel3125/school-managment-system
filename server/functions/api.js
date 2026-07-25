const serverless = require('serverless-http');
const app = require('../src/app');
const { connectDB } = require('../src/config/db');

const handler = serverless(app);

module.exports.handler = async (event, context) => {
  // Prevent AWS Lambda / Netlify Functions from waiting for Node event loop to empty
  context.callbackWaitsForEmptyEventLoop = false;

  // Ensure DB connection is active before handling requests
  try {
    await connectDB();
  } catch (err) {
    console.error('Failed to connect to MongoDB in serverless function:', err);
  }

  return await handler(event, context);
};
