const router = require("express").Router();
const User = require("../models/user");

router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  return res.send({ message: `Your Phone Number: ${phone}` });
});

module.exports = router;
