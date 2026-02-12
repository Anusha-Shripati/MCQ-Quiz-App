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
import { registerMergeQueueWorker } from '../workers/mergeWorker';
import { DeleteObjectsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { s3Client } from '../utils/S3';

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
        allowedHeaders: ['Content-Type', 'Authorization', 'x-access-code', 'x-tenant-slug', 'x-tenant-type'],
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
          res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-access-code, x-tenant-slug, x-tenant-type');
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


    this.app.get('/get-bucket', (req, res) => {

      async function listAllObjects(bucketName: any) {
        let isTruncated: any = true;
        let continuationToken;
        const allObjects = [];

        while (isTruncated) {
          const params: any = {
            Bucket: bucketName,
            ContinuationToken: continuationToken,
            MaxKeys: 1000,
          };

          const data = await s3Client.send(new ListObjectsV2Command(params));

          if (data.Contents) {
            allObjects.push(...data.Contents);
          }

          isTruncated = data.IsTruncated;
          continuationToken = data.NextContinuationToken;
        }

        return allObjects;
      }

      listAllObjects(process.env.AWS_BUCKET_NAME).then(objects => {
        console.log("Total objects:", objects.length);
        res.send(objects.map(obj => obj.Key));
      });
    })
    this.app.get('/delete-bucket', (req, res) => {

      async function listAllObjects(bucketName: any) {
        let isTruncated: any = true;
        let continuationToken;
        const allObjects = [];

        while (isTruncated) {
          const listResponse: any = await s3Client.send(
            new ListObjectsV2Command({
              Bucket: bucketName,
              ContinuationToken: continuationToken,
            })
          );

          const contents = listResponse.Contents || [];

          if (contents.length === 0) {
            console.log("Bucket is already empty.");
            return;
          }

          // Step 2: Prepare list of objects to delete
          const objectsToDelete = contents.map((item: any) => ({ Key: item.Key! }));
          console.log(objectsToDelete);

          // Step 3: Delete the batch
          await s3Client.send(
            new DeleteObjectsCommand({
              Bucket: bucketName,
              Delete: {
                Objects: objectsToDelete,
                Quiet: false,
              },
            })
          );

          console.log(`Deleted ${objectsToDelete.length} objects.`);

          isTruncated = listResponse.IsTruncated ?? false;
          continuationToken = listResponse.NextContinuationToken;
        }
      }

      listAllObjects(process.env.AWS_BUCKET_NAME).then(objects => {
        res.send('Success');
      });

    })

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
      require('../cron/exam-expiry'); 
      registerMergeQueueWorker();
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
