#!/usr/bin/env node
/**
 * Admin Seed Script
 *
 * Sets the role field for a Firestore user to 'admin'
 * This is required for your role-based security rules to work
 *
 * Usage:
 *   node seed-admin.js <uid> <email>
 *
 * Example:
 *   node seed-admin.js "user123" "admin@medvision.com"
 *
 * Prerequisites:
 *   1. Set FIREBASE_SERVICE_ACCOUNT_KEY env var to path of your Firebase service account JSON
 *      Or place it at ./firebase-service-account.json
 *   2. Run: npm install firebase-admin
 */

const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

// Get service account key path
const keyPath =
  process.env.FIREBASE_SERVICE_ACCOUNT_KEY ||
  path.join(process.cwd(), "firebase-service-account.json");

if (!fs.existsSync(keyPath)) {
  console.error("❌ Error: Service account key not found");
  console.error(`   Expected at: ${keyPath}`);
  console.error(
    "   Set FIREBASE_SERVICE_ACCOUNT_KEY env var or place file at project root",
  );
  console.error("\n📖 How to get service account key:");
  console.error("   1. Go to Firebase Console → Project Settings");
  console.error('   2. Click "Service Accounts" tab');
  console.error('   3. Click "Generate New Private Key"');
  console.error("   4. Save as firebase-service-account.json in project root");
  process.exit(1);
}

// Initialize Firebase Admin SDK
const serviceAccount = require(keyPath);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id,
});

const db = admin.firestore();

async function seedAdmin(uid, email) {
  try {
    if (!uid || !email) {
      console.error("❌ Usage: node seed-admin.js <uid> <email>");
      console.error(
        '   Example: node seed-admin.js "user123" "admin@medvision.com"',
      );
      process.exit(1);
    }

    console.log(`⏳ Setting admin role for user: ${uid}`);

    // Create or update user document with admin role
    await db.collection("users").doc(uid).set(
      {
        email: email,
        role: "admin",
        updatedAt: new Date().toISOString(),
        displayName: "Admin User",
      },
      { merge: true },
    );

    console.log(`✅ Success! User ${uid} is now an admin`);
    console.log(`📝 Document: users/${uid}`);
    console.log(`   - role: admin`);
    console.log(`   - email: ${email}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error setting admin role:", error.message);
    process.exit(1);
  }
}

// Get arguments from command line
const [, , uid, email] = process.argv;
seedAdmin(uid, email);
