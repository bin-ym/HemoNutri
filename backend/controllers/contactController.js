const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error("Nodemailer configuration error in contactController:", error);
  } else {
    console.log("Nodemailer configuration verified in contactController:", success);
  }
});

const submitContactForm = async (req, res) => {
  const { email, message } = req.body;

  console.log(`[${new Date().toISOString()}] contactController: Received contact form submission`, { email });

  try {
    if (!email || !message) {
      return res.status(400).json({ error: "Email and message are required" });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    // Save to database
    const contact = new Contact({ email, message });
    await contact.save();

    // Optionally send email notification to admin
    await transporter.sendMail({
      from: `"HemoNutri Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || "admin@hemonutri.com", // Admin email from .env
      subject: "New Contact Form Submission - HemoNutri",
      text: `
        You have received a new contact form submission:

        Email: ${email}
        Message: ${message}

        Please review this in the admin dashboard.
      `,
    });

    console.log(`[${new Date().toISOString()}] contactController: Contact saved and email sent`, { email });
    res.status(201).json({ message: "Contact form submitted successfully" });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] contactController: Error saving contact form`, err.stack);
    res.status(500).json({ error: "Failed to submit contact form" });
  }
};

module.exports = { submitContactForm };