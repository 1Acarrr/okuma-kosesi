import mongoose, { Document, Schema } from 'mongoose';

export interface INote extends Document {
  userId: mongoose.Types.ObjectId;
  bookId: mongoose.Types.ObjectId;
  content: string;
  pageNumber?: number;
  createdAt: Date;
  updatedAt: Date;
}

const noteSchema = new Schema<INote>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bookId: {
    type: Schema.Types.ObjectId,
    ref: 'Book',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  pageNumber: {
    type: Number,
    min: 1,
  },
}, {
  timestamps: true,
  collection: 'notes',
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret: any) {
      ret['id'] = ret._id.toString();
      delete ret._id;
    }
  },
  toObject: {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret: any) {
      ret['id'] = ret._id.toString();
      delete ret._id;
    }
  }
});

export const Note = mongoose.model<INote>('Note', noteSchema);