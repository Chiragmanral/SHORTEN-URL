const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { hashEmail } = require("../utils/cryptoUtils");

// 🔑 Generate Tokens
function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}
function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

exports.isTokensValid = async (req, res) => {
  const { accessToken, refreshToken } = req.body;
  try {
    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    return res.json({ validTokens: true });
  } catch {
    return res.json({ validTokens: false });
  }
};

exports.signup = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedEmail = hashEmail(email);
    const existingUser = await User.findOne({ email: hashedEmail });
    if (existingUser) return res.status(400).json({ msg: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email: hashedEmail, password: hashedPassword });
    return res.json({ success: true });
  } catch {
    return res.status(500).json({ msg: "Server error" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const hashedEmail = hashEmail(email);
    const user = await User.findOne({ email: hashedEmail });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.json({ success: false });
    }

    const payload = { id: user._id };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshToken = await bcrypt.hash(refreshToken, 10);
    await user.save();

    return res.json({ success: true, accessToken, refreshToken });
  } catch {
    return res.status(500).json({ success: false });
  }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
    return res.json({ msg: "Logged out" });
  } catch {
    return res.status(400).json({ msg: "Logout failed" });
  }
};

exports.refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;
  try {
    const decodedUser = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedUser.id);

    if (!user) return res.status(403).json({ msg: "User not found" });

    const isMatch = await bcrypt.compare(refreshToken, user.refreshToken);
    if (!isMatch) return res.status(403).json({ msg: "Invalid refresh token" });

    const newAccessToken = generateAccessToken({ id: user._id });
    return res.json({ accessToken: newAccessToken });
  } catch {
    return res.status(400).json({ msg: "Invalid refresh token" });
  }
};
