import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SMTP_HOST,
  port: Number(process.env.EMAIL_SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.EMAIL_SMTP_USER,
    pass: process.env.EMAIL_SMTP_PASS,
  },
});

export const sendMail = async ({ to, subject, html }) => {
  if (!to) return;
  const from = process.env.EMAIL_FROM || "noreply@chainescrow.com";
  await transporter.sendMail({ from, to, subject, html });
};
