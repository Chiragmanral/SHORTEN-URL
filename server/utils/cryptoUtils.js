const crypto = require("crypto");

function hashEmail(email) {
  return crypto.createHash("sha256").update(email.toLowerCase()).digest("hex");
}

module.exports = { hashEmail }; 
