const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const url =
  process.env.MONGO_URI ||
  process.env.DATABASE_URL ||
  "mongodb+srv://rajritik4041_db_user:euQ0hK4CVX99yHSg@shop.hsensxz.mongodb.net/internshala?retryWrites=true&w=majority";

module.exports.connect = async () => {
  try {
    await mongoose.connect(url);
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
    console.error("Database connection error:", err.message);
  }
};