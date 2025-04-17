import nodemailer from "nodemailer"

/*const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMPT_USER,
    pass: process.env.SMPT_PASS,
  },
});

export default transporter;*/

  // Step 1: Set up transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SENDER_EMAIL, // your Gmail
      pass: 'vegb reue cidv fnsx'    // App password, NOT your Gmail password
    }
  });

   
  
export default transporter;