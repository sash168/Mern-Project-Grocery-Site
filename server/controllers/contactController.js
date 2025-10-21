import express from "express";
import nodemailer from "nodemailer";

const contactRouter = express.Router();

contactRouter.post("/", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, message: "Required fields missing." });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail", // or any SMTP service
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: email,
      to: process.env.EMAIL_USER,
      subject: subject || `Contact Form Message from ${name}`,
      text: message,
    });

    res.json({ success: true, message: "Message sent successfully!" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to send message." });
  }
});

export default contactRouter;
