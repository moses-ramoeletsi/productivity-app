import { Schema, model } from 'mongoose';

const todoSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    type: String,
    required: [true, 'Task is required'],
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default model('Todo', todoSchema);