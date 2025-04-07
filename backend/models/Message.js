const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    isEmergency: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    providerUsername: { type: String, default: '' }, // Populated manually if needed
    patientUsername: { type: String, default: '' },  // Populated manually if needed
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Indexes for efficient querying
MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, createdAt: -1 });

// Pre-save hook to populate usernames (optional, requires User model reference)
MessageSchema.pre('save', async function (next) {
  if (!this.providerUsername || !this.patientUsername) {
    const User = mongoose.model('User');
    const [sender, recipient] = await Promise.all([
      User.findById(this.sender).select('username role'),
      User.findById(this.recipient).select('username role'),
    ]);
    this.providerUsername = sender?.role === 'provider' ? sender.username : '';
    this.patientUsername = recipient?.role === 'patient' ? recipient.username : '';
  }
  next();
});

module.exports = mongoose.model('Message', MessageSchema);