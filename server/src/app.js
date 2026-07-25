const logger = require('./utils/logger');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const healthRouter = require('./routes/health');
const tenantsRouter = require('./routes/tenants');
const authRouter = require('./routes/auth');
const superadminRouter = require('./routes/superadmin');
const classesRouter = require('./routes/classes');
const studentsRouter = require('./routes/students');
const staffRouter = require('./routes/staff');
const teachersRouter = require('./routes/teachers');
const adminRouter = require('./routes/admin');
const uploadRouter = require('./routes/upload');
const paymentsRouter = require('./routes/payments');
const contactsRouter = require('./routes/contacts');
const announcementsRouter = require('./routes/announcements');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// Configure CORS with explicit origin validation and wildcard subdomain support
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [];

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, mobile apps, server-to-server)
    if (!origin) return callback(null, true);

    // Development & Subdomain patterns match (e.g. localhost, schoola.localhost, 127.0.0.1)
    const isAllowedLocal = /^http:\/\/(?:[a-z0-9-]+\.)*localhost(?::\d+)?$/i.test(origin);
    const isAllowedIP = /^http:\/\/127\.0\.0\.1(?::\d+)?$/i.test(origin);
    const isExplicitlyAllowed = allowedOrigins.includes(origin);

    if (isAllowedLocal || isAllowedIP || isExplicitlyAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS Access Denied: Origin '${origin}' is not authorized.`));
    }
  },
  credentials: true
}));

// Cookies and Body Parsers
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    logger.info(`[${new Date().toISOString()}] ${req.method} ${req.url} - Host: ${req.headers.host}`);
    next();
  });
}

// Routes
app.use('/api/v1', healthRouter);
app.use('/api/v1/tenants', tenantsRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/superadmin', superadminRouter);
app.use('/api/v1/classes', classesRouter);
app.use('/api/v1/students', studentsRouter);
app.use('/api/v1/staff', staffRouter);
app.use('/api/v1/teachers', teachersRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/payments', paymentsRouter);
app.use('/api/v1/contacts', contactsRouter);
app.use('/api/v1/announcements', announcementsRouter);

// Fallback for unhandled endpoints
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
