import mongoose from "mongoose";
import Message from "../models/Message.js";
import { sendContactNotification } from "../services/mailer.js";
import { sendContactSmsNotification } from "../services/smsNotifier.js";

const sanitize = (value = "") => value.toString().trim();
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maxMessageLength = 2000;

const fallbackInbox = [];

const storeFallbackMessage = (payload) => {
  const fallbackId = Date.now().toString();

  fallbackInbox.push({
    id: fallbackId,
    ...payload,
    createdAt: new Date().toISOString(),
  });

  return fallbackId;
};

const getNotificationStatus = (result) => {
  if (result.status === "fulfilled") {
    return result.value.sent ? "sent" : result.value.reason || "skipped";
  }

  return "failed";
};

export const createMessage = async (req, res) => {
  const name = sanitize(req.body?.name);
  const email = sanitize(req.body?.email);
  const message = sanitize(req.body?.message);

  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ message: "Name, email, and message are required." });
  }

  if (!emailPattern.test(email)) {
    return res
      .status(400)
      .json({ message: "Please enter a valid email address." });
  }

  if (message.length < 10) {
    return res
      .status(400)
      .json({ message: "Message must be at least 10 characters." });
  }

  if (message.length > maxMessageLength) {
    return res.status(400).json({
      message: `Message must be at most ${maxMessageLength} characters.`,
    });
  }

  const payload = { name, email, message };

  try {
    let responseStatus = 201;
    let responseMessage = "Message sent successfully.";
    let messageId = "";
    let storage = "database";
    const notifications = {
      email: "pending",
      sms: "pending",
    };

    if (mongoose.connection.readyState !== 1) {
      messageId = storeFallbackMessage(payload);
      storage = "fallback";
      responseStatus = 202;
      responseMessage =
        "Message received. Configure MongoDB to store messages permanently.";
      console.warn(
        "Contact message stored in fallback mode: MongoDB is not connected.",
      );
    } else {
      try {
        const savedMessage = await Message.create(payload);
        messageId = savedMessage._id;
      } catch (dbError) {
        if (dbError?.name === "ValidationError") {
          return res
            .status(400)
            .json({ message: "Message payload is invalid." });
        }

        messageId = storeFallbackMessage(payload);
        storage = "fallback";
        responseStatus = 202;
        responseMessage =
          "Message received. Configure MongoDB to store messages permanently.";
        console.warn(
          "Contact message stored in fallback mode:",
          dbError.message,
        );
      }
    }

    const [emailResult, smsResult] = await Promise.allSettled([
      sendContactNotification(payload),
      sendContactSmsNotification(payload),
    ]);

    notifications.email = getNotificationStatus(emailResult);
    notifications.sms = getNotificationStatus(smsResult);

    if (
      emailResult.status === "fulfilled" &&
      !emailResult.value.sent &&
      emailResult.value.reason === "not-configured"
    ) {
      console.warn(
        "SMTP is not configured. Skipping email notification for contact message.",
      );
    }

    if (
      smsResult.status === "fulfilled" &&
      !smsResult.value.sent &&
      smsResult.value.reason === "not-configured"
    ) {
      console.warn(
        "SMS is not configured. Skipping mobile notification for contact message.",
      );
    }

    if (emailResult.status === "rejected") {
      console.error(
        "Failed to send contact notification email:",
        emailResult.reason?.message || emailResult.reason,
      );
    }

    if (smsResult.status === "rejected") {
      console.error(
        "Failed to send SMS notification:",
        smsResult.reason?.message || smsResult.reason,
      );
    }

    return res.status(responseStatus).json({
      message: responseMessage,
      id: messageId,
      storage,
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Unable to send message right now.",
      error: error.message,
    });
  }
};
