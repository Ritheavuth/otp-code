const router = require("express").Router();
const User = require("../models/user");
const client = require('twilio')('AC1833a7d81802bc9085301c5bfa461cdb','283c63626c51b57f4971e3fe4098bf66')

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  // const vonage = new Vonage({
  //   apiKey: "6474bd37",
  //   apiSecret: "RzgZcj8tE0JadOad",
  // });
  // const from = "PaylessGate Team";
  // const to = phone;

  const newUser = new User({
    phone: phone,
  });

  await newUser.generateOtp();
  const text = "OTP Code: " + newUser.otp.code;
  async function sendSMS() {
    client.messages 
      .create({         
         to: phone ,
         body : 'Your OTP Verition Code is '+newUser.otp.code,
         from : '+15719827694'


       }) 
      .then(message => console.log(message)) 
      .catch(err => console.log(err));
    // await vonage.sms
    //   .send({ to, from, text })
    //   .then(async (response) => {
    //     const userExists = await User.findOne({ phone: phone });
    //     if (!userExists) {
    //     }
    //   })
    //   .catch((err) => {
    //     console.log("There was an error sending the messages.");
    //     console.error(err);
    //   });
  }

  const userExist = User.findOne({ phone: phone });

  if (newUser.otp.code) {
    await newUser.save();
    sendSMS();
    return res
      .status(200)
      .send({ message: `Code has been sent to ${phone.replace("855", "0")}` });
  } else {
    res
      .status(500)
      .send({ message: "Internal Server Error" });
  }
});
router.post("/verify-otp", async (req, res) => {
  const userData = User.findOne(
    { phone: req.body.phone },
    async (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Internal server error");
      }
      if (!user) {
        return res.status(404).send("User not found");
      }
      if (
        user.otp.code === req.body.otpCode &&
        user.otp.expiresAt > Date.now()
      ) {
        // Reset the OTP code
        const options = {
          upsert: true,
          new: true,
        };

        try {
          const result = await User.findOneAndUpdate(
            { phone: req.body.phone },
            { otp: { code: null, attempts: 0, expiresAt: null } },
            options
          );
          return res.send({
            success: true,
            message: "Your Account has been verified",
          });
        } catch (error) {
          res.status(400).send({ success: false, message: "Error is here" });
        }
      } else {
        const result = await User.findOneAndUpdate(
          { phone: req.body.phone },

          {
            otp: {
              attempts: user.otp.attempts + 1,
            },
          },
          options
        );
        return res.send("You have entered the wrong code");
      }
    }
  );
});

module.exports = router;
