import express from 'express';
import serverless from 'serverless-http';
import { router } from './routes/route';
import mongoose from 'mongoose';
import env from 'dotenv';
import path from 'path';
env.config();
const app = express();

app.use(express.json());

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
