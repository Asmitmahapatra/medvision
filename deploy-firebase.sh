#!/bin/bash
# MEDVISION Firebase Deployment Script for macOS/Linux
# Run from project root: bash deploy-firebase.sh

set -e

echo ""
echo "================================================================================"
echo "MEDVISION Firebase Deployment Script"
echo "================================================================================"
echo ""

# Check if running from correct directory
if [ ! -f "firestore.rules" ]; then
    echo "Error: firestore.rules not found in current directory"
    echo "This script must be run from the medvision-frontend project root"
    exit 1
fi

# Check Node.js installation
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "Step 1: Checking dependencies..."
npm list firebase-admin > /dev/null 2>&1 || npm install firebase-admin
npm list -g firebase-tools > /dev/null 2>&1 || npm install -g firebase-tools

echo ""
echo "================================================================================"
echo "Step 2: Firebase Authentication"
echo "================================================================================"
echo ""
echo "The browser window will open for authentication."
echo "Please approve Firebase CLI access in the browser."
echo ""

firebase login

echo ""
echo "================================================================================"
echo "Step 3: Firebase Initialization"
echo "================================================================================"
echo ""
echo "This will set up your local Firebase configuration."
echo "When prompted:"
echo "  - Select your existing Firebase project"
echo "  - Use 'firestore.rules' for Firestore rules file"
echo "  - Use 'storage.rules' for Storage rules file"
echo ""

firebase init

echo ""
echo "================================================================================"
echo "Step 4: Deploying Rules"
echo "================================================================================"
echo ""

firebase deploy --only firestore:rules,storage

echo ""
echo "================================================================================"
echo "SUCCESS! Rules deployed to Firebase"
echo "================================================================================"
echo ""
echo "Next steps:"
echo "1. Install firebase-admin: npm install firebase-admin"
echo "2. Get service account key from Firebase Console"
echo "3. Save as firebase-service-account.json in project root"
echo "4. Run: node seed-admin.js YOUR_UID your.email@example.com"
echo ""
echo "For more details, see DEPLOYMENT_CHECKLIST.md"
echo ""
