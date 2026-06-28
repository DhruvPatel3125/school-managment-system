const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const dialect = process.env.DB_DIALECT || 'sqlite';
const dbName = process.env.DB_NAME || 'educore_db';
const dbUser = process.env.DB_USER || 'educore_user';
const dbPassword = process.env.DB_PASSWORD || 'educore_password';
const dbHost = process.env.DB_HOST || '127.0.0.1';
const dbPort = process.env.DB_PORT || 3306;

let sequelize;

if (dialect === 'sqlite') {
  const sqliteStorage = path.join(__dirname, '../../educore.sqlite');
  console.log(`🔌 Database Mode: SQLite. Database file at: ${sqliteStorage}`);
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: sqliteStorage,
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    define: {
      timestamps: true,
      underscored: true
    }
  });
} else {
  console.log(`🔌 Database Mode: MySQL. Connecting to ${dbName} on ${dbHost}:${dbPort} as ${dbUser}...`);
  sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    port: dbPort,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  });
}

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connection has been established successfully via ${dialect.toUpperCase()}.`);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    if (dialect === 'mysql') {
      console.warn('\n💡 TIP: If you do not have MySQL running locally, set DB_DIALECT=sqlite in your .env file to run using SQLite.');
    }
    process.exit(1);
  }
};

module.exports = {
  sequelize,
  connectDB
};
