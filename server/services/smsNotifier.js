import twilio from "twilio";

const readEnv = (...keys) => {
  for (const key of keys) {
    const value = process.env[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
};

const normalizePhoneNumber = (value) => {
  const raw = (value || "").toString().trim();

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
  accountSid: readEnv(
    "TWILIO_ACCOUNT_SID",
    "TWILIO_SID",
    "SMS_ACCOUNT_SID",
  ),
  authToken: readEnv(
    "TWILIO_AUTH_TOKEN",
    "TWILIO_TOKEN",
    "SMS_AUTH_TOKEN",
  ),
  fromNumber: normalizePhoneNumber(readEnv(
    "TWILIO_PHONE_NUMBER",
    "TWILIO_FROM_NUMBER",
    "SMS_FROM",
  )),
  toNumber: normalizePhoneNumber(
    readEnv("SMS_TO", "TWILIO_TO_NUMBER", "SMS_TO_NUMBER"),
  ),
});

const hasPlaceholderSmsCredentials = (config) => {
  const accountSid = (config.accountSid || "").trim().toLowerCase();
  const authToken = (config.authToken || "").trim().toLowerCase();

  return (
    accountSid.includes("your-twilio") || authToken.includes("your-twilio")
  );
};

const isSmsConfigured = (config) =>
  Boolean(
    config.accountSid &&
    config.authToken &&
    config.fromNumber &&
    config.toNumber &&
    !hasPlaceholderSmsCredentials(config),
  );

const sanitizeSmsText = (value = "") =>
  value.toString().replace(/\s+/g, " ").trim();

const buildSmsBody = ({ name, email, message }) => {
  const compactMessage = sanitizeSmsText(message);
  const maxSmsBodyLength = 1150;
  const clippedMessage =
    compactMessage.length > maxSmsBodyLength
      ? `${compactMessage.slice(0, maxSmsBodyLength - 3)}...`
      : compactMessage;

  return `New portfolio message\nName: ${sanitizeSmsText(name)}\nEmail: ${sanitizeSmsText(
    email,
  )}\nMessage: ${clippedMessage}`;
};

export const sendContactSmsNotification = async ({ name, email, message }) => {
  const config = getSmsConfig();

  if (!isSmsConfigured(config)) {
    return { sent: false, reason: "not-configured" };
  }

  const client = twilio(config.accountSid, config.authToken);

  await client.messages.create({
    from: config.fromNumber,
    to: config.toNumber,
    body: buildSmsBody({ name, email, message }),
  });

  return { sent: true };
};
