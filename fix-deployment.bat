@echo off
echo 🔧 EduFlow LMS - Fixing Deployment Issues
echo ========================================

echo.
echo 📦 Adding fixed backend files...
git add server/index.js

echo.
echo 💾 Committing deployment fixes...
git commit -m "Fix: Remove static file serving from backend for separate deployments"

echo.
echo 📤 Pushing fixes to GitHub...
git push origin main

echo.
echo ✅ Backend fixes pushed! 
echo.
echo 🚀 Next steps:
echo 1. Wait for Render to redeploy (2-3 minutes)
echo 2. Check your Render backend logs
echo 3. Verify environment variables in Render:
echo    - CLIENT_URL should be your Vercel URL
echo    - MONGODB_URI should be your Atlas connection string
echo.
echo 🔍 To test:
echo 1. Visit your backend health check: https://your-backend.onrender.com/health
echo 2. Should return: {"status":"OK",...}
echo 3. Test your frontend login/register
echo.
echo 📋 If still having issues:
echo - Check Render logs for errors
echo - Verify MongoDB Atlas IP whitelist (0.0.0.0/0)
echo - Verify environment variables match
echo.
pause