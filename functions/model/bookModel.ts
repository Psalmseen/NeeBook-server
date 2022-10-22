import { Schema, model } from 'mongoose';

const bookSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  imageUrl: String,
  description: {
    type: String,
    required: true,
  },
  review: {
    type: Number,
    required: true,
  },
  rents: {
    type: Number,
    required: true,
  },
  genre: Array,
});

export default model('Book', bookSchema);
