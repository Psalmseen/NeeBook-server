import { Schema, model, SchemaTypes } from 'mongoose';

const UserSchema = new Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  imageUrl: String,

  emailVerified: {
    type: Boolean,
    required: true,
  },

  accessToken: String,
  library: {
    type: [SchemaTypes.ObjectId],
    ref: 'Book',
  },
});

export default model('User', UserSchema);
