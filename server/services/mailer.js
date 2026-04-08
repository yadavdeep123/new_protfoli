import nodemailer from "nodemailer";

const toBoolean = (value) => value?.toString().toLowerCase() === "true";

const getMailerConfig = () => {
  const port = Number(process.env.SMTP_PORT || 587);

  return {
    host: process.env.SMTP_HOST,
    port,
    secure: toBoolean(process.env.SMTP_SECURE),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM,
    to: process.env.MAIL_TO
  };
};

const hasPlaceholderSmtpCredentials = (config) => {
  const user = (config.user || "").trim().toLowerCase();
  const pass = (config.pass || "").trim().toLowerCase();

  return user === "your-email@gmail.com" || pass === "your-app-password";
};

const isMailerConfigured = (config) =>
  Boolean(
    config.host &&
      config.port &&
      config.user &&
      config.pass &&
      config.to &&
      !hasPlaceholderSmtpCredentials(config)
  );

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const sendContactNotification = async ({ name, email, message }) => {
  const config = getMailerConfig();

  if (!isMailerConfigured(config)) {
    return { sent: false, reason: "not-configured" };
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass
    }
  });

  const subject = `New portfolio message from ${name}`;

  await transporter.sendMail({
    from: config.from || config.user,
    to: config.to,
    replyTo: email,
    subject,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h2 style="margin-bottom: 12px;">New Portfolio Message</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replaceAll("\n", "<br />")}</p>
      </div>
    `
  });

  return { sent: true };
};
