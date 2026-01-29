import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

// User Schema (simplified for script)
const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      enum: ["student", "instructor", "admin"],
      default: "student",
    },
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    isInstructorApproved: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model("User", userSchema);

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/eduflow_lms",
    );
    console.log("Connected to MongoDB");

    // Admin user data
    const adminData = {
      username: "admin",
      email: "admin@eduflow.com",
      password: "admin123", // Change this to a secure password
      firstName: "System",
      lastName: "Administrator",
      role: "admin",
      isActive: true,
      isEmailVerified: true,
      isInstructorApproved: true,
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      $or: [
        { email: adminData.email },
        { username: adminData.username },
        { role: "admin" },
      ],
    });

    if (existingAdmin) {
      console.log("❌ Admin user already exists!");
      console.log("Existing admin:", {
        username: existingAdmin.username,
        email: existingAdmin.email,
        role: existingAdmin.role,
      });
      process.exit(1);
    }

    // Create admin user
    const admin = new User(adminData);
    await admin.save();

    console.log("✅ Admin user created successfully!");
    console.log("Admin credentials:");
    console.log("  Email:", adminData.email);
    console.log("  Username:", adminData.username);
    console.log("  Password:", adminData.password);
    console.log("");
    console.log("🔐 IMPORTANT SECURITY NOTES:");
    console.log("1. Change the default password immediately after first login");
    console.log("2. Use the admin login page: /admin-login");
    console.log("3. Consider setting up ADMIN_LOGIN_KEY environment variable");
    console.log("4. Enable 2FA when available");
    console.log("");
    console.log("🌐 Admin login URL: http://localhost:3000/admin-login");
  } catch (error) {
    console.error("❌ Error creating admin user:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
    process.exit(0);
  }
}

// Run the script
createAdmin();
