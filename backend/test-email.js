require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.sendMail({
  from: 'binyam.tagel@gmail.com',
  to: 'binguto@gmail.com',
  subject: 'Test Email',
  text: 'This is a test from HemoNutri!',
}, (err, info) => {
  if (err) console.error('Test email error:', err);
  else console.log('Test email sent:', info.response);
});