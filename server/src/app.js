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
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// Configure CORS to allow credentials and wildcard subdomains
app.use(cors({
  origin: true, // Allow request's actual origin
  credentials: true
}));

// Cookies and Body Parsers
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - Host: ${req.headers.host}`);
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

// Fallback for unhandled endpoints
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Global Error Handler
app.use(errorHandler);

module.exports = app;
