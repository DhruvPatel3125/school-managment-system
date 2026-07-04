const fs = require('fs');
const path = require('path');
const serverFile = path.join('src', 'server.js');
const seedFile = path.join('src', 'seed.js');
let code = fs.readFileSync(serverFile, 'utf8');

const seedRegex = /\/\/ 2\. Database Seeding.*?(?=\/\/ 3\. Start API Server Listener)/s;
const match = seedRegex.exec(code);

if (match) {
  const seedLogic = match[0].trim();
  const newServerCode = code.replace(seedLogic, '');
  fs.writeFileSync(serverFile, newServerCode);
  
  const seedScript = `require('dotenv').config({ path: '../.env' });
const { connectDB } = require('./config/db');
const mongoose = require('mongoose');

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

const runSeed = async () => {
  try {
    await connectDB();
    
    // Set NODE_ENV to development for the seeding logic to run
    process.env.NODE_ENV = 'development';
    
    ${seedLogic}
    
    console.log('✅ Database seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to seed database:', error);
    process.exit(1);
  }
};

runSeed();
`;
  fs.writeFileSync(seedFile, seedScript);
  console.log('Successfully split server.js and seed.js');
} else {
  console.log('Could not find seed logic block');
}
