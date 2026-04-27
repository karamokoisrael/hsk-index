const nodemailer = require('nodemailer');

async function sendEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465
    auth: {
      user: 'garrydenis763@gmail.com',
      pass: 'bicf glkl cxmw cnmp', // NOT your normal password
    },
  });

  const mailOptions = {
    from: 'garrydenis763@gmail.com',
    to: 'mstx777@gmail.com',
    subject: 'Test Email 🚀',
    text: 'Hello! This is a test email using Nodemailer + Gmail SMTP.',
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.response);
  } catch (error) {
    console.error('Error:', error);
  }
}

sendEmail();
