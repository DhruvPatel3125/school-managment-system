require('dotenv').config({ path: '../.env' }); // Load root env variables
const app = require('./app');
const { connectDB, sequelize } = require('./config/db');

// Import models to ensure they are synchronized with the database
const Tenant = require('./models/tenant');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // 1. Authenticate Database connection
    await connectDB();

    // 2. Synchronize models (in production, use migrations instead)
    if (process.env.NODE_ENV === 'development') {
      console.log('Synchronizing database models...');
      await sequelize.sync({ alter: true });
      console.log('✅ All models were synchronized successfully.');

      // Check if we have any seed tenants, if not create a default one for local development
      const tenantCount = await Tenant.count();
      if (tenantCount === 0) {
        console.log('Database empty. Seeding demo tenants for development...');
        await Tenant.bulkCreate([
          {
            schoolName: 'Delhi Public School',
            subdomain: 'schoola',
            logoUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?q=80&w=200&h=200&fit=crop',
            primaryColor: '#1e3a8a', // Dark Blue
            secondaryColor: '#d97706', // Amber/Orange
            status: 'active'
          },
          {
            schoolName: 'St. Mary School',
            subdomain: 'schoolb',
            logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=200&h=200&fit=crop',
            primaryColor: '#065f46', // Emerald Green
            secondaryColor: '#9d174d', // Deep Rose/Pink
            status: 'active'
          }
        ]);
        console.log('✅ Demo tenants seeded.');
      }
    }

    // 3. Start Listening
    app.listen(PORT, () => {
      console.log(`🚀 EduCore ERP API Server listening on port ${PORT} in ${process.env.NODE_ENV} mode.`);
    });
  } catch (error) {
    console.error('❌ Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
