import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(this: IUser) {
  if (!this.isModified('password')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(12);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
  } catch (error: any) {
    console.error('Password hashing error:', error);
    throw error;
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    if (!this.password) {
      console.error('comparePassword: User password is missing');
      return false;
    }
    
    // Eğer şifre hash'lenmemişse (eski kayıtlar için geçici çözüm)
    if (!this.password.startsWith('$2')) {
      console.warn('comparePassword: Password is not hashed! This is a security issue. Please run migration script.');
      // Geçici olarak düz metin karşılaştırma yap (sadece eski kayıtlar için)
      // Migration script çalıştırıldıktan sonra bu kısım kaldırılabilir
      const isMatch = candidatePassword === this.password;
      if (isMatch) {
        console.warn('⚠️  Plain text password match detected. Please run: npm run migrate:hash-passwords');
        // Şifreyi otomatik olarak hash'le (bir sonraki kayıt için)
        try {
          const salt = await bcrypt.genSalt(12);
          const hash = await bcrypt.hash(candidatePassword, salt);
          // Şifreyi güncelle (pre-save hook'u bypass etmek için direkt update)
          await (this.constructor as any).updateOne(
            { _id: this._id },
            { $set: { password: hash } }
          );
          console.log('✅ Password automatically hashed for user:', this.email);
        } catch (hashError) {
          console.error('Failed to auto-hash password:', hashError);
        }
      }
      return isMatch;
    }
    
    // Normal hash'lenmiş şifre karşılaştırması
    const result = await bcrypt.compare(candidatePassword, this.password);
    return result;
  } catch (error) {
    console.error('comparePassword error:', error);
    return false;
  }
};

export const User = mongoose.model<IUser>('User', userSchema);