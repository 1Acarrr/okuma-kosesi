import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'E-posta, şifre ve ad gereklidir' });
    }

    // Normalize email (lowercase and trim)
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }

    // Create new user
    const user = new User({ email: normalizedEmail, password, name: name.trim() });
    console.log('Creating user with email:', normalizedEmail);
    console.log('Password before save (length):', password.length);
    await user.save();
    console.log('User saved. Password after save (is hashed):', user.password?.startsWith('$2'));

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ 
        message: 'Validation error',
        details: errors.join(', ')
      });
    }
    
    // Mongoose duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Bu e-posta adresi zaten kullanılıyor'
      });
    }
    
    res.status(500).json({ 
      message: 'Kayıt sırasında bir hata oluştu',
      details: error.message 
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'E-posta ve şifre gereklidir' });
    }

    // Normalize email (lowercase and trim) - User model has lowercase: true but we should normalize here too
    const normalizedEmail = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      console.log('Login attempt failed: User not found for email:', normalizedEmail);
      return res.status(401).json({ message: 'E-posta veya şifre hatalı' });
    }

    console.log('User found:', {
      email: user.email,
      passwordHashLength: user.password?.length,
      passwordStartsWithDollar: user.password?.startsWith('$2')
    });

    // Check password
    console.log('Comparing password...');
    const isValidPassword = await user.comparePassword(password);
    console.log('Password comparison result:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Login attempt failed: Invalid password for email:', normalizedEmail);
      // Additional debug: check if password is hashed
      if (!user.password?.startsWith('$2')) {
        console.error('WARNING: Password in database is not hashed! This is a security issue.');
      }
      return res.status(401).json({ message: 'E-posta veya şifre hatalı' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );

    console.log('Login successful for user:', user.email);

    res.json({
      message: 'Giriş başarılı',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Giriş sırasında bir hata oluştu',
      details: error.message 
    });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};