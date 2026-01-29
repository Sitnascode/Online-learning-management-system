#!/usr/bin/env node

/**
 * Environment Variables Checker for EduFlow LMS
 * Run this to verify your deployment configuration
 */

import dotenv from "dotenv";
dotenv.config();

console.log("🔍 EduFlow LMS - Environment Variables Check");
console.log("===========================================\n");

const requiredVars = ["MONGODB_URI", "JWT_SECRET", "CLIENT_URL"];

const optionalVars = [
  "NODE_ENV",
  "PORT",
  "JWT_EXPIRES_IN",
  "EMAIL_HOST",
  "EMAIL_PORT",
  "EMAIL_USER",
  "EMAIL_PASS",
];

console.log("📋 Required Variables:");
let allRequired = true;

requiredVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(
      `✅ ${varName}: ${varName === "MONGODB_URI" || varName === "JWT_SECRET" ? "[HIDDEN]" : value}`,
    );
  } else {
    console.log(`❌ ${varName}: MISSING`);
    allRequired = false;
  }
});

console.log("\n📋 Optional Variables:");
optionalVars.forEach((varName) => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${value}`);
  } else {
    console.log(`⚠️  ${varName}: Not set (using default)`);
  }
});

console.log("\n🔗 Connection Tests:");

// Test MongoDB connection
if (process.env.MONGODB_URI) {
  if (process.env.MONGODB_URI.includes("mongodb+srv://")) {
    console.log("✅ MongoDB URI: Atlas connection string detected");
  } else if (process.env.MONGODB_URI.includes("mongodb://")) {
    console.log("✅ MongoDB URI: Local connection string detected");
  } else {
    console.log("❌ MongoDB URI: Invalid format");
  }
} else {
  console.log("❌ MongoDB URI: Missing");
}

// Test CLIENT_URL
if (process.env.CLIENT_URL) {
  if (process.env.CLIENT_URL.includes("vercel.app")) {
    console.log("✅ CLIENT_URL: Vercel deployment detected");
  } else if (process.env.CLIENT_URL.includes("localhost")) {
    console.log("⚠️  CLIENT_URL: Local development URL");
  } else {
    console.log("✅ CLIENT_URL: Custom domain detected");
  }
} else {
  console.log("❌ CLIENT_URL: Missing");
}

console.log("\n📊 Summary:");
if (allRequired) {
  console.log("✅ All required environment variables are set!");
  console.log("🚀 Your backend should be ready for deployment.");
} else {
  console.log("❌ Some required environment variables are missing.");
  console.log(
    "🔧 Please set the missing variables in your deployment platform.",
  );
}

console.log("\n📖 For Render deployment:");
console.log("1. Go to your Render service dashboard");
console.log('2. Click on "Environment" tab');
console.log("3. Add/update the missing variables");
console.log("4. Save changes (will trigger redeploy)");

console.log("\n📖 For Vercel deployment:");
console.log("1. Go to your Vercel project dashboard");
console.log("2. Go to Settings → Environment Variables");
console.log("3. Add: VITE_API_URL=https://your-backend.onrender.com/api");
console.log("4. Redeploy your frontend");
