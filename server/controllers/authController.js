const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { hashEmail } = require("../utils/cryptoUtils");

function generateAccessToken(payload) {
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}
function generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

exports.isTokensValid = async (req, res) => {
    const { refreshToken } = req.body;
    try {
        const decodedUserByRefreshToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

        if ( decodedUserByRefreshToken) {
            return res.status(200).json({ validTokens: true });
        }
        return res.status(400).json({ validTokens: false });
    }
    catch (err) {
        return res.status(400).json({ validTokens: false });
    }
};

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedEmail = hashEmail(email);
    const existingUser = await User.findOne({ email: hashedEmail });
    if (existingUser) {
      return res.status(400).json({ success: false, msg: "Email already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      email: hashedEmail,
      password: hashedPassword
    })
    return res.status(201).json({ success: true });
  }
  catch (err) {
    return res.status(500).json({ success: false, msg: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedEmail = hashEmail(email);
    const user = await User.findOne({ email: hashedEmail });
    if (!user || (await bcrypt.compare(password, user.password) === false)) {
      return res.status(400).json({ success: false, msg : "Invalid credentials" });
    }
    const payload = { id: user._id };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = refreshToken;
    await user.save(); // save method is only used for the object user present in the User database.

    return res.status(200).json({ success: true, accessToken, refreshToken });
  }
  catch (err) {
    return res.status(500).json({ success: false , msg : "Server error"});
  }
};

exports.logout = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(403).json({ msg: "No refresh token provided" }); // Refresh token is not provided by the frontend
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) {
          return res.status(404).json({ msg: "User not found" }); 
        }

        const isMatch = (refreshToken === user.refreshToken);
        if (!isMatch) {
          return res.status(401).json({ msg: "Invalid refresh token not the valid user" }); // Refresh token is invalid
        }

        user.refreshToken = null;
        await user.save();
        return res.status(200).json({ msg: "Logged out successfully" });
    } catch {
        console.log("Logout failed");
        return res.status(401).json({ msg: "Logout failed bcz invalid refresh token either tampered or expired!!" }); // Invalid refresh token either tampered or expired!!
    }
};

exports.refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if(!refreshToken) {
    return res.status(403).json({ msg : "Refresh token not found"}); //No refresh token is come from the frontend 
  }
  
  try {
    const decodedUser = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedUser.id);

    if (!user) {
      return res.status(404).json({ msg: "User not found" }); 
    }

    // Compare hashed token with bcrypt
    const isMatch = (refreshToken === user.refreshToken);
    if (!isMatch) {
      return res.status(401).json({ msg: "Invalid refresh token not the valid user" }); // Refresh token is invalid
    }

    const newAccessToken = generateAccessToken({ id: user._id });
    return res.status(201).json({ accessToken: newAccessToken });
  } catch {
    return res.status(401).json({ msg: "Invalid refresh token either tampered or expired!!" }); // Refresh token is invalid
  }
};
