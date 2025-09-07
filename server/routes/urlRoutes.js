const express = require("express");
const router = express.Router();
const {
  getUserUrls,
  createShortUrl,
  redirectUrl,
  analytics,
  deleteShortUrl
} = require("../controllers/urlController");

const authenticateToken = require("../middleware/authMiddleware");

router.get("/shortUrls", authenticateToken, getUserUrls);
router.post("/short", authenticateToken, createShortUrl);
router.get("/:shortId", redirectUrl);
router.get("/analytics/:shortId", authenticateToken, analytics);
router.post("/deleteShortUrl", authenticateToken, deleteShortUrl);

module.exports = router;
