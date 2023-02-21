const express = require("express");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
const randomstring = require("randomstring");

const app = express();
app.use(bodyParser.json());

// Initialize Firebase Admin SDK with service account credentials
const serviceAccount = require("./config/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Define the API endpoint to send OTP codes to phone numbers
app.post("/send-otp", async (req, res) => {
  const phoneNumber = req.body.phone;

  // Generate a random 6-digit OTP code
  //   const otpCode = randomstring.generate({
  //     length: 6,
  //     charset: "numeric",
  //   });
  //   const message = {
  //     notification: {
  //       title: "OTP code",
  //       body: `Verification Code: ${otpCode}`,
  //     },
  //     token: "token get from the android app",
  //   };

  //   try {
  //     await admin.messaging().send(message);
  //     res.status(200).json({ message: "OTP sent successfully" });
  //   } catch (error) {
  //     console.log(error);
  //     res.status(500).json({ error: "Error sending OTP" });
  //   }
  try {
    const phone = req.body.phone;

    // Send verification code to the specified phone number
    const verificationResult = await admin.auth().verifyPhoneNumber(phone);

    // Generate OTP code and notification message
    const otpCode = Math.floor(1000 + Math.random() * 9000);
    const message = {
      notification: {
        title: "Your OTP code",
        body: `Your OTP code is: ${otpCode}`,
      },
      token: verificationResult.sessionInfo.notification.token,
    };

    // Send notification message using FCM
    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);

    res.status(200).json({ message: "OTP code sent successfully" });
  } catch (error) {
    console.error("Error sending OTP code:", error);
    res.status(500).json({ error: "Error sending OTP code" });
  }
});

app.listen(4000, () => {
  console.log("API server is listening on port 4000");
});
