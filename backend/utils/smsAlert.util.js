import twilio from "twilio";
import Worker from "../models/worker.model.js";

// Utility: Send SMS using Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;

let twilioClient = null;
if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

async function sendSMS(to, message) {
  if (!twilioClient) {
    console.log("Twilio not configured. SMS not sent.");
    return;
  }
  try {
    // await twilioClient.messages.create({
    //     body: message,
    //     from: twilioPhone,
    //     to: to
    // });
    // console.log(`SMS sent to ${to}: ${message}`);
  } catch (err) {
    console.log(`Failed to send SMS to ${to}:`, err.message);
  }
}

async function sendSMSForWorkers(workerIds) {
  try {
    const workers = await Worker.find({ _id: { $in: workerIds } });
    for (let worker of workers) {
      const phone = "+919531670207" || "<WORKER_PHONE_NUMBER>";
      const helmetId = worker.helmetId || "<HELMET_ID>";
      const workerId = worker._id;

      const message = `ALERT: Worker ${workerId} (Helmet: ${helmetId}) is in a High Risk Zone!`;
      sendSMS(phone, message);
    }
  } catch (err) {
    console.log("Error in sendSMSForWorkers:", err.message);
  }
}

export { sendSMSForWorkers };
