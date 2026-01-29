@echo off
echo 🔧 EduFlow LMS - Fixing CORS and API Issues
echo ==========================================

echo.
echo 📦 Adding fixed files...
git add server/index.js
git add client/public/manifest.json
git add .env

echo.
echo 💾 Committing CORS fixes...
git commit -m "Fix: CORS configuration and manifest.json for production deployment"

echo.
echo 📤 Pushing fixes to GitHub...
git push origin main

echo.
echo ✅ CORS fixes pushed! 
echo.
echo 🚀 Next steps:
echo 1. Wait for Render to redeploy (2-3 minutes)
echo 2. Update Render environment variables:
echo    CLIENT_URL=https://eduflowlms-psi.vercel.app
echo.
echo 3. Update Vercel environment variables:
echo    VITE_API_URL=https://online-learning-management-system-he6h.onrender.com/api
echo.
echo 🔍 After deployment:
echo 1. Test backend: https://online-learning-management-system-he6h.onrender.com/health
echo 2. Test frontend registration/login
echo.
echo 📋 Your URLs:
echo Frontend: https://eduflowlms-psi.vercel.app
echo Backend:  https://online-learning-management-system-he6h.onrender.com
echo API:      https://online-learning-management-system-he6h.onrender.com/api
echo.
pause