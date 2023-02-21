const router = require("express").Router();
const User = require("../models/user");
const { Vonage } = require('@vonage/server-sdk')

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  const vonage = new Vonage({
    apiKey: "6474bd37",
    apiSecret: "RzgZcj8tE0JadOad"
  })
  const from = "PaylessGate Team"
  const to = "855966815223"
  const otp = 9234
  const text = 'OTP Code: '+otp
  console.log(to);
  async function sendSMS() {
      await vonage.sms.send({to, from, text})
          .then(resp => { console.log('Message sent successfully'); console.log(resp); })
          .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
  }
  sendSMS();
  return res.send({ message: `Your Phone Number: ${phone}` });
});
router.post("/verify-otp", async (req, res) => {
  const { otp,phone } = req.body;
  
  if(otp == 9234){
    const newUser = await new User({
      name: "John Doe",
      phone: phone,
    });
    return res.send({ message: "New user created",user:newUser });
  }
  return res.send({ message: "Wrong OTP Code" });

});

module.exports = router;
