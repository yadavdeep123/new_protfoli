import twilio from "twilio";

const sanitize = (value = "") => value.toString().trim();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const normalizePhoneNumber = (value = "") => {
  const raw = sanitize(value);

  if (!raw) {
    return "";
  }

  if (raw.startsWith("+")) {
    return `+${raw.slice(1).replace(/\D/g, "")}`;
  }

  const digitsOnly = raw.replace(/\D/g, "");

  if (/^\d{10}$/.test(digitsOnly)) {
    return `+91${digitsOnly}`;
  }

  if (/^\d{11,15}$/.test(digitsOnly)) {
    return `+${digitsOnly}`;
  }

  return raw;
};

const getSmsConfig = () => ({
  accountSid: sanitize(process.env.TWILIO_ACCOUNT_SID),
  authToken: sanitize(process.env.TWILIO_AUTH_TOKEN),
  fromNumber: normalizePhoneNumber(process.env.TWILIO_PHONE_NUMBER),
  toNumber: normalizePhoneNumber(process.env.SMS_TO),
});

const isConfigured = (config) =>
  Boolean(
    config.accountSid &&
      config.authToken &&
      config.fromNumber &&
      config.toNumber,
  );

const buildSmsBody = ({ name, email, message }) => {
  const compactMessage = sanitize(message).replace(/\s+/g, " ");
  const maxMessageLength = 1100;
  const clippedMessage =
    compactMessage.length > maxMessageLength
      ? `${compactMessage.slice(0, maxMessageLength - 3)}...`
      : compactMessage;

  return `New portfolio message\nName: ${sanitize(name)}\nEmail: ${sanitize(
    email,
  )}\nMessage: ${clippedMessage}`;
};

const readPayload = (body) => {
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body && typeof body === "object" ? body : {};
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  const body = readPayload(req.body);
  const name = sanitize(body.name);
  const email = sanitize(body.email);
  const message = sanitize(body.message);

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ message: "Name, email, and message are required." });
  }

  if (!emailPattern.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email." });
  }

  if (message.length < 10) {
    return res
      .status(400)
      .json({ message: "Message must be at least 10 characters." });
  }

  const smsConfig = getSmsConfig();
  if (!isConfigured(smsConfig)) {
    return res.status(500).json({
      message: "SMS service is not configured.",
      notifications: { sms: "not-configured" },
    });
  }

  try {
    const client = twilio(smsConfig.accountSid, smsConfig.authToken);
    const sms = await client.messages.create({
      from: smsConfig.fromNumber,
      to: smsConfig.toNumber,
      body: buildSmsBody({ name, email, message }),
    });

    return res.status(201).json({
      message: "Message sent successfully.",
      id: sms.sid,
      notifications: { sms: "sent" },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to send message right now.",
      notifications: { sms: "failed" },
      error: error.message,
    });
  }
}