import express from 'express';
import serverless from 'serverless-http';
import { router } from './routes/route';
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

app.use(router);
app.use(
  '/images',
  express.static(path.join(__dirname, '..', '..', '..', '..', '..', 'images'))
);
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
