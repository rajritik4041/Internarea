const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

// Only set custom DNS on Windows if needed (avoids breaking internal DNS on Render/Linux containers)
if (process.platform === "win32") {
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch (e) {}
}

const DIRECT_REPLICA_URL =
  "mongodb://rajritik4041_db_user:euQ0hK4CVX99yHSg@ac-szsnxyt-shard-00-00.hsensxz.mongodb.net:27017,ac-szsnxyt-shard-00-01.hsensxz.mongodb.net:27017,ac-szsnxyt-shard-00-02.hsensxz.mongodb.net:27017/internshala?ssl=true&replicaSet=atlas-bq517f-shard-0&authSource=admin&retryWrites=true&w=majority";

const url =
  process.env.MONGO_URI ||
  process.env.DATABASE_URL ||
  DIRECT_REPLICA_URL;

let isConnected = false;

module.exports.connect = async () => {
  if (isConnected) return;
  try {
    await mongoose.connect(url, {
      serverSelectionTimeoutMS: 8000,
    });
    isConnected = true;
    console.log("Database connected successfully to MongoDB Atlas!");

    const Admin = require("../Model/Admin");
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create({
        Name: "Super Admin",
        Email: "admin@internarea.com",
        Password: "admin123",
        role: "admin",
      });
      console.log("Default admin created");
    }
  } catch (err) {
    console.error("Database connection error with primary URI:", err.message);
    // If primary URI failed (e.g. SRV timeout or DNS lookup failure on cloud hosts), fallback to direct replicaSet URI
    if (url !== DIRECT_REPLICA_URL) {
      try {
        console.log("Attempting fallback to direct replicaSet URI...");
        await mongoose.connect(DIRECT_REPLICA_URL, {
          serverSelectionTimeoutMS: 8000,
        });
        isConnected = true;
        console.log("Database connected successfully via direct replicaSet URI!");
      } catch (fallbackErr) {
        console.error("Fallback database connection error:", fallbackErr.message);
      }
    }
  }
};