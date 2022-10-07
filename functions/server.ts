import express from 'express';
import serverless from 'serverless-http';
import { router } from './routes/route';
import mongoose from 'mongoose';
import env from 'dotenv';
import { createModuleResolutionCache } from 'typescript';
env.config();
const app = express();

app.use(router);
app.use(express.json());

let conn: any = null;

export const connect = async () => {
  if (conn === null) {
    conn = mongoose
      .connect(
        `mongodb+srv://Psalmseen:Psalmseen7268@neebook.qf0bqxs.mongodb.net/book-store?retryWrites=true&w=majority`,
        // `mongodb+srv://Psalmseen:${process.env.DB_PASSWORD}@neebook.qf0bqxs.mongodb.net/${process.env.DB_COLLECTION}?retryWrites=true&w=majority`,
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
