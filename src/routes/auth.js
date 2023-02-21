const router = require("express").Router();
const User = require("../models/user");
const client = require("twilio")(process.env.APP_ID, process.env.TOKEN);

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  const newUser = new User({
    phone: phone,
  });

  await newUser.generateOtp();
  async function sendSMS() {
    client.messages
      .create({
        to: phone,
        body: "Your OTP Verition Code is " + newUser.otp.code,
        from: "+15719827694",
      })
      .then((message) => console.log(message))
      .catch((err) => console.log(err));
  }

  const userExist = User.findOne({ phone: phone });

  if (newUser.otp.code) {
    await newUser.save();
    sendSMS();
    return res
      .status(200)
      .send({ message: `Code has been sent to ${phone.replace("855", "0")}` });
  } else {
    res.status(500).send({ message: "Internal Server Error" });
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
        const options = {
          upsert: true,
          new: true,
        };
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
