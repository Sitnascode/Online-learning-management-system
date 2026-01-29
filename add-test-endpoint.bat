@echo off
echo 🧪 EduFlow LMS - Adding Test Endpoint and Testing API
echo ==================================================

echo.
echo 📦 Adding test endpoint to auth routes...
git add server/routes/auth.js
git add test-api.js

echo.
echo 💾 Committing test endpoint...
git commit -m "Add test endpoint to auth routes for API verification"

echo.
echo 📤 Pushing to GitHub...
git push origin main

echo.
echo ✅ Test endpoint added! 
echo.
echo 🔍 Wait 2-3 minutes for Render to redeploy, then test:
echo.
echo 📋 Test these URLs in your browser:
echo 1. Health Check: https://online-learning-management-system-he6h.onrender.com/health
echo 2. API Root: https://online-learning-management-system-he6h.onrender.com/
echo 3. Auth Test: https://online-learning-management-system-he6h.onrender.com/api/auth/test
echo.
echo 🎯 Expected Results:
echo 1. Health: {"status":"OK",...}
echo 2. Root: {"message":"EduFlow LMS API",...}
echo 3. Auth Test: {"success":true,"message":"Auth routes are working!",...}
echo.
echo 🚀 If all tests pass, your API is working correctly!
echo The 500 error was likely due to missing environment variables.
echo.
echo 📋 Final step: Make sure Vercel has this environment variable:
echo VITE_API_URL=https://online-learning-management-system-he6h.onrender.com/api
echo.
pause