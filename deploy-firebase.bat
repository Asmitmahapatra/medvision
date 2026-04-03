@echo off
REM MEDVISION Firebase Deployment Script for Windows
REM This script automates the Firebase setup and deployment process

setlocal enabledelayedexpansion

echo.
echo ================================================================================
echo MEDVISION Firebase Deployment Script
echo ================================================================================
echo.

REM Check if running from correct directory
if not exist "firestore.rules" (
    echo Error: firestore.rules not found in current directory
    echo This script must be run from the medvision-frontend project root
    echo.
    pause
    exit /b 1
)

REM Check Node.js installation
node --version >nul 2>&1
if errorlevel 1 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo Step 1: Checking dependencies...
npm list firebase-admin >nul 2>&1
if errorlevel 1 (
    echo Installing firebase-admin...
    call npm install firebase-admin
)

npm list -g firebase-tools >nul 2>&1
if errorlevel 1 (
    echo Installing firebase-tools globally...
    call npm install -g firebase-tools
)

echo.
echo ================================================================================
echo Step 2: Firebase Authentication
echo ================================================================================
echo.
echo The browser window will open for authentication.
echo Please approve Firebase CLI access in the browser.
echo.

firebase login
if errorlevel 1 (
    echo Error: Firebase login failed
    pause
    exit /b 1
)

echo.
echo ================================================================================
echo Step 3: Firebase Initialization
echo ================================================================================
echo.
echo This will set up your local Firebase configuration.
echo When prompted:
echo   - Select your existing Firebase project
echo   - Use "firestore.rules" for Firestore rules file
echo   - Use "storage.rules" for Storage rules file
echo.

firebase init
if errorlevel 1 (
    echo Error: Firebase init failed
    pause
    exit /b 1
)

echo.
echo ================================================================================
echo Step 4: Deploying Rules
echo ================================================================================
echo.

firebase deploy --only firestore:rules,storage
if errorlevel 1 (
    echo Error: Firebase deploy failed
    pause
    exit /b 1
)

echo.
echo ================================================================================
echo SUCCESS! Rules deployed to Firebase
echo ================================================================================
echo.
echo Next steps:
echo 1. Install firebase-admin: npm install firebase-admin
echo 2. Get service account key from Firebase Console
echo 3. Save as firebase-service-account.json in project root
echo 4. Run: node seed-admin.js YOUR_UID your.email@example.com
echo.
echo For more details, see DEPLOYMENT_CHECKLIST.md
echo.

pause
