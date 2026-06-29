import mongoose, { Document, Schema } from 'mongoose';

export interface IReadingSession extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  durationMinutes: number;
  pagesRead?: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const readingSessionSchema = new Schema<IReadingSession>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: false,
  },
  durationMinutes: {
    type: Number,
    required: true,
    min: 1,
  },
  pagesRead: {
    type: Number,
    min: 0,
  },
  date: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

export const ReadingSession = mongoose.model<IReadingSession>('ReadingSession', readingSessionSchema);