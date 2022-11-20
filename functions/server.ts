import express from 'express';
import serverless from 'serverless-http';
import { router } from './routes/routeRoutes';
import { authRouter } from './routes/authRoutes';
import mongoose from 'mongoose';
import env from 'dotenv';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';

env.config();
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.set('trust proxy', 1);

app.use(router);
app.use('/auth', authRouter);
app.use(
  '/images',
  express.static(path.join(__dirname, '..', '..', '..', '..', '..', 'images'))
);
app.get('/', (_, res) => {
  res.sendFile(
    path.join(__dirname, '..', '..', '..', '..', '..', 'dist', 'index.html')
  );
});
app.use('*', (_, res) => {
  res.status(404).json({ message: 'Route not found' });
});
app.use((err: any, req: any, res: any, next: any) => {
  res.status(500).json({ message: err });
});
let conn: any = null;

export const connect = async () => {
  if (conn === null) {
    conn = mongoose
      .connect(
        `mongodb+srv://Psalmseen:${process.env.DB_PASSWORD}@neebook.qf0bqxs.mongodb.net/${process.env.DB_COLLECTION}?retryWrites=true&w=majority`,
        { serverSelectionTimeoutMS: 5000 }
      )
      .then(() => mongoose);
    await conn;
  }
};
connect();
export const handler = conn
  ? serverless(app)
  : () => {
      console.log('Server stopedclear');
    };
