const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  refreshAccessToken,
  isTokensValid
} = require("../controllers/authController");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refreshAccessToken", refreshAccessToken);
router.post("/isTokensValid", isTokensValid);

module.exports = router;
