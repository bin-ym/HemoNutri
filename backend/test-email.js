// test-email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'binyam.tagel@gmail.com',
    pass: 'rjqexxxlupcmyzen',
  },
});

transporter.sendMail({
  from: 'binyam.tagel@gmail.com',
  to: 'binyam.tagel@gmail.com',
  subject: 'Test Email',
  text: 'This is a test email from HemoNutri.',
})
.then(() => console.log('Email sent successfully'))
.catch((err) => console.error('Email error:', err));