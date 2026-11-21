import mongoose from 'mongoose';
import { ACTIONS } from './validateSwipe.js';

const profileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 18 },
    bio: { type: String, required: true },
  },
  { versionKey: false },
);

const swipeSchema = new mongoose.Schema(
  {
    profileId: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ACTIONS },
  },
  { timestamps: true, versionKey: false },
);

export const Profile = mongoose.model('Profile', profileSchema);
export const Swipe = mongoose.model('Swipe', swipeSchema);