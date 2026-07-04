const logger = require('./utils/logger');
require('dotenv').config({ path: '../.env' }); // Load root env variables
const app = require('./app');
const { connectDB } = require('./config/db');

// Import Mongoose models to verify/seed the database collections
const Tenant = require('./models/tenant');
const Role = require('./models/role');
const Permission = require('./models/permission');
const User = require('./models/user');
const Class = require('./models/class');
const Student = require('./models/student');
const Staff = require('./models/staff');
const Attendance = require('./models/attendance');
const Assignment = require('./models/assignment');
const Fee = require('./models/fee');

const PORT = process.env.PORT || 5000;

/**
 * Initializes database connection, seeds initial platform data (tenants, roles, permissions, users),
 * and starts listening for HTTP traffic.
 */
const startServer = async () => {
  try {
    // 1. Establish connection to MongoDB Atlas or local MongoDB
    await connectDB();

    

    // 3. Start API Server Listener
    app.listen(PORT, () => {
      logger.info(`🚀 EduCore ERP API Server listening on port ${PORT} in ${process.env.NODE_ENV} mode.`);
    });
  } catch (error) {
    logger.error('❌ Failed to launch API Server:', error.stack || error);
    process.exit(1);
  }
};

startServer();
