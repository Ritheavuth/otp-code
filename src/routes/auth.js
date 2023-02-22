const router = require("express").Router();
const User = require("../models/user");
const sdk = require("api")("@movider/v1.0#3dy29x1ekssmjp2d");

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  const newUser = new User({
    phone: phone,
  });

  async function sendSMS() {
    sdk
      .postVerify(
        {
          api_key: process.env.API_KEY,
          api_secret: process.env.API_SECRET,
          to: phone,
        },
        { accept: "application/json" }
      )
      .then(async ({ data }) => {
        newUser.request_id = data.request_id;
        await newUser.save();
        console.log(data);
        return res
          .status(200)
          .send({
            message: `Code has been sent to ${phone.replace("+855", "0")}`,
          });
      })
      .catch((err) => res.status(500).send({ message: err }));
  }
  await sendSMS();
});

router.post("/verify-otp", async (req, res) => {
  const code = req.body.otpCode;
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

      sdk
        .postVerifyAcknowledge(
          {
            api_key: process.env.API_KEY,
            api_secret: process.env.API_SECRET,
            request_id: user.request_id,
            code: code,
          },
          { accept: "application/json" }
        )
        .then(async ({ data }) => {
          const options = {
            upsert: true,
            new: true,
          };

          try {
            const result = await User.findOneAndUpdate(
              { phone: req.body.phone },
              { verified: true },
              options
            );
            return res.send({
              success: true,
              message: "Your Account has been verified",
            });
          } catch (error) {
            res.status(400).send({ success: false, message: error });
          }
        })
        .catch((err) => {
          return res.send(err)
        });
    }
  );
});

module.exports = router;
