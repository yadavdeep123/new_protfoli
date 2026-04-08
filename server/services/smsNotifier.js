import twilio from "twilio";

const getSmsConfig = () => ({
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  fromNumber: process.env.TWILIO_PHONE_NUMBER,
  toNumber: process.env.SMS_TO,
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
