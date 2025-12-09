import express from 'express';
import cors from 'cors';
import { config } from './config';
import { testConnection } from './models/db';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import routes from './routes';

const app = express();

// Middleware
app.use(cors({
  origin: config.clientUrl,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Expense Tracker API',
    version: '1.0.0',
    status: 'running',
  });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
async function startServer() {
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('Warning: Database connection failed. Server will start but DB features won\'t work.');
  }

  app.listen(config.port, () => {
    console.log(`\nServer running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Client URL: ${config.clientUrl}\n`);
  });
}

startServer();

export default app;
