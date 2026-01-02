const nodemailer = require("nodemailer");

async function sendEmail(setting, subject, html) {
  const transporter = nodemailer.createTransport({
    host: setting.host,
    port: setting.port,
    secure: Number(setting.port) === 465, // SSL hanya 465
    auth: {
      user: setting.username,
      pass: setting.password,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  await transporter.verify();

  return transporter.sendMail({
    from: `"Uptime Monitor" <${setting.from_email}>`,
    to: setting.to_email,
    subject,
    html,
  });
}

module.exports = { sendEmail };
