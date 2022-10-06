import express from 'express';
import serverless from 'serverless-http';

const app = express();

app.get('/app', (req, res) => {
  res.json({
    path: 'Home',
    firstName: 'Samson',
    lastName: 'Oyebamiji',
  });
});

export const handler = serverless(app);
