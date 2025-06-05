import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';

// Local imports
import { rateLimiter } from '../config/rateLimiter';
// import { serverAdapter } from "../config/bullboard";
import { errorHandler } from '../middlewares/errorHandler.middleware';
import { connectToDatabase } from '../db/prisma.client';
// import { registerCreateArticleWorkerEvents } from "../common/queue/articles.worker";
import { logger } from '../config/logger';
import golbalRouter from '../routes';
import path from 'path';

class ExpressAppProvider {
  public app: Express;
  private port: number | string;

  constructor() {
    this.app = express();
    this.port = process.env.BACKEND_PORT || 3001;
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
    this.initializeSignalHandlers();
  }

  private initializeMiddlewares(): void {
    // Configure CORS
    this.app.use(
      cors({
        origin: '*', // No trailing
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-access-code'],
        // credentials: true,
        exposedHeaders: ['Content-Range', 'X-Content-Range'],
      })
    );

    // Configure Helmet with video streaming permissions
    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
      })
    );

    this.app.use(rateLimiter);
    this.app.use(express.json());

    // Configure static file serving with proper headers
    this.app.use(
      '/uploads',
      express.static(path.join(__dirname, '../../uploads'), {
        setHeaders: (res, path) => {
          res.set('Cross-Origin-Resource-Policy', 'cross-origin');
          res.set(
            'Access-Control-Allow-Origin',
            process.env.FRONTEND_URL || 'http://localhost:3000'
          );
          res.set('Access-Control-Allow-Credentials', 'true');
          res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-access-code');
        },
      })
    );
    // this.app.use("/bullboard", serverAdapter.getRouter());
  }

  private initializeRoutes(): void {
    this.app.use('/api/v1', golbalRouter);
    this.app.get('/healthcheck', (req: Request, res: Response) => {
      console.log('Healthcheck called');
      res.status(200).json({ message: 'Server is up and running' });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private initializeSignalHandlers(): void {
    process.on('SIGINT', () => {
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      process.exit(0);
    });
  }

  public async startServer(): Promise<void> {
    try {
      await connectToDatabase();
      this.app.listen(this.port, () => {
        // registerCreateArticleWorkerEvents();
        console.log(`Console Server is running on http://localhost:${this.port}`);
        logger.info(`Server is running on http://localhost:${this.port}`);
      });
    } catch (error) {
      logger.error('Failed to start the server:', error);
    }
  }

  public getServer(): Express {
    return this.app;
  }
}

const appInstance = new ExpressAppProvider();

export default appInstance;
