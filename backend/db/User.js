const mongoose = require('mongoose');

/**
 * User schema — no longer embeds expenses/incomes.
 * Transactions live in their own collections (Expense, Income models).
 * Added: role field for admin support, name/profilePic for profile,
 *        resetToken fields for password reset.
 */
const userSchema = new mongoose.Schema({
  username:             { type: String, required: true },
  name:                 { type: String, default: '' },
  email:                { type: String, required: true, unique: true },
  password:             { type: String, required: true },
  role:                 { type: String, enum: ['user', 'admin'], default: 'user' },
  profilePic:           { type: String, default: '' },
  refreshTokenHash:     { type: String, select: false },
  refreshTokenExpiresAt:{ type: Date },
  resetToken:           { type: String },
  resetTokenExpiration: { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
