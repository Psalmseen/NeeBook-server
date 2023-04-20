import { Schema, model, SchemaTypes } from 'mongoose';

const TokenSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

export default model('Token', TokenSchema);
