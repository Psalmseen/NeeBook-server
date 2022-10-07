// import fs from 'fs';
const fs = require('fs');
const genres = ['Horror', 'Thriller', 'Romance', 'Comedy'];
const userArray = Array(20)
  .fill('')
  .map((_, i) => ({
    title: `title_${i + 1}`,
    author: `author_${i + 1}`,
    imageUrl: `img_${i + 1}`,
    description: `description_${i + 1}`,
    review: Number((Math.random() * 4).toFixed(1)) + 1,
    genre: [
      ...new Set(
        Array(Math.floor(Math.random() * 2 + 1))
          .fill('')
          .map((_) => genres[Math.floor(Math.random() * 4)])
      ),
    ],
    rents: Math.floor(Math.random() * 500) + 200,
  }));

fs.writeFileSync('./user.json', JSON.stringify(userArray));
