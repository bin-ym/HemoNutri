// backend/controllers/contactController.js
const Contact = require('../models/Contact');
const nodemailer = require('nodemailer');
const sanitizeHtml = require('sanitize-html'); // Add for input sanitization
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error(`[${new Date().toISOString()}] Nodemailer configuration error:`, error);
  } else {
    console.log(`[${new Date().toISOString()}] Nodemailer configuration verified`);
  }
});

const submitContactForm = async (req, res) => {
  const { email, message } = req.body;

  console.log(`[${new Date().toISOString()}] Received contact form submission`, { email });

  try {
    if (!email || !message) {
      return res.status(400).json({ error: 'Email and message are required' });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeHtml(email.trim());
    const sanitizedMessage = sanitizeHtml(message.trim());

    // Save to database
    const contact = new Contact({ email: sanitizedEmail, message: sanitizedMessage });
    await contact.save();

    // Send email notification to admin
    try {
      await transporter.sendMail({
        from: `"HemoNutri Contact" <${process.env.EMAIL_USER}>`,
        to: process.env.ADMIN_EMAIL || 'admin@hemonutri.com',
        subject: 'New Contact Form Submission - HemoNutri',
        text: `
          You have received a new contact form submission:

          Email: ${sanitizedEmail}
          Message: ${sanitizedMessage}

          Please review this in the admin dashboard.
        `,
      });
      console.log(`[${new Date().toISOString()}] Email sent to admin`, { email: sanitizedEmail });
    } catch (emailError) {
      console.error(`[${new Date().toISOString()}] Email sending failed:`, emailError);
      // Don't fail the request if email fails
    }

    console.log(`[${new Date().toISOString()}] Contact saved`, { email: sanitizedEmail });
    res.status(201).json({ message: 'Contact form submitted successfully' });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] Error saving contact form:`, err.stack);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
};

module.exports = { submitContactForm };