import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    passwordHash: {
      type: String,
      default: null
    },
    role: {
      type: String,
      enum: ['admin', 'client'],
      default: 'client',
      index: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    accountStatus: {
      type: String,
      enum: ['active', 'suspended', 'pending_invitation'],
      default: 'active'
    },
    passwordResetToken: {
      type: String,
      default: null
    },
    passwordResetExpires: {
      type: Date,
      default: null
    },
    magicLoginToken: {
      type: String,
      default: null
    },
    magicLoginExpires: {
      type: Date,
      default: null
    },
    googleId: {
      type: String,
      default: null,
      sparse: true,
      index: true
    },
    avatar: {
      type: String,
      default: null
    },
    authProvider: {
      type: String,
      enum: ['local', 'google', 'magic'],
      default: 'local'
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.passwordHash;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.magicLoginToken;
        delete ret.magicLoginExpires;
        delete ret.__v;
        return ret;
      }
    }
  }
);

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(plainPassword, salt);
};

export const User = mongoose.model('User', userSchema);
