const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    isEmergency: { type: Boolean, default: false },
    read: { type: Boolean, default: false },
    providerUsername: { type: String, default: '' },
    patientUsername: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

MessageSchema.index({ sender: 1, createdAt: -1 });
MessageSchema.index({ recipient: 1, createdAt: -1 });

MessageSchema.pre('save', async function (next) {
  try {
    const User = mongoose.model('User');
    const [sender, recipient] = await Promise.all([
      User.findById(this.sender).select('username role'),
      User.findById(this.recipient).select('username role'),
    ]);
    if (!sender || !recipient) throw new Error('Sender or recipient not found');
    this.providerUsername = sender.role === 'provider' ? sender.username : recipient.role === 'provider' ? recipient.username : '';
    this.patientUsername = sender.role === 'patient' ? sender.username : recipient.role === 'patient' ? recipient.username : '';
    console.log('Pre-save message:', { senderId: this.sender.toString(), recipientId: this.recipient.toString(), providerUsername: this.providerUsername, patientUsername: this.patientUsername, content: this.content });
    next();
  } catch (err) {
    console.error('Pre-save error:', err.message);
    next(err);
  }
});

module.exports = mongoose.model('Message', MessageSchema);