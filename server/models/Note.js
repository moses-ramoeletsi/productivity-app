import { Schema, model } from 'mongoose';

const noteSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  steps: {
    type: [String],
    default: []
  }
}, { timestamps: true });

export default model('Note', noteSchema);