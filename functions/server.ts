import express from 'express';
import serverless from 'serverless-http';

const app = express();

app.get('/', (req, res) => {
  res.json({
    path: 'Home',
    firstName: 'Samson',
    lastName: 'Oyebamiji',
  });
});

app.get('/json', (req, res) => {
  res.json({
    auth: 'Oyebamiji Samson',
    path: '/json',
  });
});

export const handler = serverless(app);
