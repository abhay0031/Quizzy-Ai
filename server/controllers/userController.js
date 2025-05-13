
const jwt = require("jsonwebtoken")
const User = require("../models/User")
const bcrypt = require("bcrypt")
const nodemailer = require("nodemailer")
const randomstring = require("randomstring")

const otpCache = {}

const generateOTP = () => {
  return randomstring.generate({ length: 4, charset: "numeric" })
}

const sendOTP = (email, otp) => {
  const mailOptions = {
    from: "chomalmedha@gmail.com", 
    to: email,
    subject: "OTP Verification for Quizzy",
    text: `Your OTP for verification is: ${otp}\nThis OTP will expire in 10 minutes.`,
  }

  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "chomalmedha@gmail.com", 
      pass: "sebl epvb gzeg xako", 
    },
    tls: {
      rejectUnauthorized: false, 
    },
  })

  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending OTP email:", error)
        reject(error)
      } else {
        console.log("OTP Email sent successfully:", info.response)
        resolve(info)
      }
    })
  })
}

exports.requestOTP = async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" })
    }

    const emailExists = await User.findOne({ email })
    if (emailExists) {
      return res.status(400).json({
        success: false,
        error: "Email is already registered, Please log in",
      })
    }

    const otp = generateOTP()

    otpCache[email] = {
      otp,
      expiry: Date.now() + 10 * 60 * 1000, 
    }

    await sendOTP(email, otp)

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    })
  } catch (error) {
    console.log("ERROR WHILE SENDING OTP: ", error)
    return res.status(500).json({
      success: false,
      error: "Failed to send OTP",
    })
  }
}

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: "Email and OTP are required",
      })
    }

    if (!otpCache[email]) {
      return res.status(400).json({
        success: false,
        error: "OTP expired or not requested",
      })
    }

    if (otpCache[email].expiry < Date.now()) {
      delete otpCache[email]
      return res.status(400).json({
        success: false,
        error: "OTP expired",
      })
    }

    if (otpCache[email].otp !== otp) {
      return res.status(400).json({
        success: false,
        error: "Invalid OTP",
      })
    }

    delete otpCache[email]

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    })
  } catch (error) {
    console.log("ERROR WHILE VERIFYING OTP: ", error)
    return res.status(500).json({
      success: false,
      error: "Failed to verify OTP",
    })
  }
}

exports.register = async (req, res) => {
  try {
    const { email, username, password, confirmPassword, role } = req.body

    if (!username || !email || !password || !confirmPassword || !role) {
      return res.status(400).json({ success: false, error: "Please fill all the fields" })
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: "Password and Confirm Password should be same",
      })
    }

    const emailExists = await User.findOne({ email })

    if (emailExists) {
      return res.status(400).json({ success: false, error: "Email is already registered, Please log in" })
    }

    const usernameExists = await User.findOne({ username })

    if (usernameExists) {
      return res.status(400).json({ success: false, error: "Username already exists" })
    }

    const hashedPasssword = await bcrypt.hash(password, 10)

    const user = await User.create({
      username,
      email,
      password: hashedPasssword,
      role,
    })

    return res.status(200).json({ success: true, message: "User created successfully" })
  } catch (error) {
    console.log("ERROR WHILE REGISTERING THE NEW USER : ", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

// ✅ Login endpoint (unchanged)
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Please fill all the fields" })
    }

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ success: false, error: "User not found" })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(400).json({ success: false, error: "Invalid credentials" })
    }

    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    })

    // create cookie and send res
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    }

    return res
      .cookie("token", token, options)
      .status(200)
      .json({
        success: true,
        message: "User logged in successfully",
        data: {
          token,
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            role: user.role,
            createdAt: user.createdAt,
            attemptedQuizzes: user?.attemptedQuizes || [],
          },
        },
      })
  } catch (error) {
    console.log("ERROR WHILE LOGGIN IN THE USER : ", error)
    return res.status(500).json({ success: false, error: "Internal server error" })
  }
}

