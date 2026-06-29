import mongoose, { Document, Schema } from 'mongoose';

export interface IBook extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  author: string;
  coverUrl?: string;
  totalPages?: number;
  currentPage?: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: String,
    required: true,
    trim: true,
  },
  coverUrl: {
    type: String,
    trim: true,
  },
  totalPages: {
    type: Number,
    min: 1,
  },
  currentPage: {
    type: Number,
    default: 0,
    min: 0,
  },
}, {
  timestamps: true,
  collection: 'books',
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      ret['id'] = ret._id.toString();
      delete ret._id;
    }
  },
  toObject: {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) {
      ret['id'] = ret._id;
      delete ret._id;
    }
  }
});

export const Book = mongoose.model<IBook>('Book', bookSchema);