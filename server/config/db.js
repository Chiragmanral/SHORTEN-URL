const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB Atlas connected");
  } catch (err) {
    console.error("❌ Error connecting MongoDB:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
