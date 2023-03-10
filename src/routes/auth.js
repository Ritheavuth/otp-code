const router = require("express").Router();
const User = require("../models/user");
const axios =require('axios')
router.post("/send-otp", async (req, res) => {
  const  phone  = req.body.phone;
  const hashkey = req.body.hashkey;

  const otp = Math.floor(100000 + Math.random() * 900000);

  // const existUser = await User.findOne({phone: phone},)
  // console.log(existUser)
    await axios.post(`https://cloudapi.plasgate.com/rest/send?private_key=${process.env.PRIVATE_KEY}`,{
      "sender" : "SMS Info",
      "to" : phone ,
      "content" : "[x] OTP code is " + otp + " " + hashkey
  },{
      headers: {
        'Content-Type': 'application/json',
        'X-Secret' : process.env.SECRET_KEY
      }
    }).then(async (response) => {
      console.log(response.data)
      const existUser = await User.findOne({phone: phone})
      if(existUser){
        existUser.otp = otp
        existUser.save()
        return res.status(200).json({message : "Notification Sent to existing user",existUser})
      }
      const newUser = new User({
        phone: phone,
        otp : otp
      })
      newUser.save()
      res.status(200).json({message : "Notification Sent to new user",newUser})

    }).catch((error) => {
      console.log(error)
      return res.status(500).json({message : err})
    })
  
})
router.post("/verify-otp", async (req, res) => {
  const code = req.body.otpCode;
   const user = await User.findOne(
    { phone: req.body.phone })
    if(!user){
      return res.status(404).json({message : "User not found"})
    }
    if(user.otp == code){
      user.verified = true
      user.save()
      return res.status(200).json({message : "User verified",user})
    }
    return res.status(400).json({message : "Invalid OTP"})
})

module.exports = router;
