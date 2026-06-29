import mongoose, { Document, Schema } from 'mongoose';

export interface IQuote extends Document {
    userId: mongoose.Types.ObjectId;
    bookId: mongoose.Types.ObjectId;
    content: string;
    pageNumber?: number;
    createdAt: Date;
    updatedAt: Date;
}

const quoteSchema = new Schema<IQuote>({
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
        trim: true,
    },
    pageNumber: {
        type: Number,
        min: 0,
    },
}, {
    timestamps: true,
    collection: 'quotes',
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

export const Quote = mongoose.model<IQuote>('Quote', quoteSchema);
