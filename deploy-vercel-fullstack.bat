@echo off
echo 🚀 EduFlow LMS - Full-Stack Vercel Deployment
echo ============================================

echo.
echo 📦 Adding all files for full-stack deployment...
git add .

echo.
echo 💾 Committing full-stack configuration...
git commit -m "Configure full-stack deployment on Vercel - Fix CORS issues"

echo.
echo 📤 Pushing to GitHub...
git push origin main

echo.
echo ✅ Code pushed to GitHub!
echo.
echo 🚀 Now deploy to Vercel:
echo 1. Go to https://vercel.com/dashboard
echo 2. Click "New Project"
echo 3. Import your GitHub repo: Sitnascode/Online-learning-management-system
echo 4. Vercel will auto-detect the configuration
echo 5. Click "Deploy"
echo.
echo 🎯 After deployment:
echo - Your app will be at: https://your-project-name.vercel.app
echo - Both frontend and backend will be on the same domain
echo - No CORS issues!
echo - Admin login: https://your-project-name.vercel.app/admin/login
echo.
echo 📋 Benefits of this approach:
echo ✅ No CORS issues (same domain)
echo ✅ Easier to manage (one deployment)
echo ✅ Faster (no cross-domain requests)
echo ✅ More reliable
echo.
echo 🔧 If you prefer to keep Render + Vercel:
echo Update Render CLIENT_URL to: https://eduflow-adod0ndwt-sitra-nasirs-projects.vercel.app
echo.
pause