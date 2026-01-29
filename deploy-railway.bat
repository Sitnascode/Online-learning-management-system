@echo off
echo 🚀 EduFlow LMS - Railway Deployment (EASIEST SOLUTION)
echo ===================================================

echo.
echo ✅ CORS fixed to allow multiple origins including your current Vercel URL
echo ✅ Railway configuration added
echo ✅ No more hardcoded URLs!

echo.
echo 📦 Adding Railway deployment files...
git add railway.json
git add Procfile
git add server/index.js

echo.
echo 💾 Committing Railway deployment...
git commit -m "Deploy to Railway with flexible CORS configuration"

echo.
echo 📤 Pushing to GitHub...
git push origin main

echo.
echo ✅ Code pushed to GitHub!
echo.
echo 🚀 Now deploy to Railway (MUCH EASIER than Render):
echo.
echo 📋 Steps:
echo 1. Go to: https://railway.app
echo 2. Sign up with GitHub
echo 3. Click "New Project"
echo 4. Select "Deploy from GitHub repo"
echo 5. Choose: Sitnascode/Online-learning-management-system
echo 6. Railway will auto-detect and deploy!
echo.
echo 🔧 Set Environment Variables in Railway:
echo NODE_ENV=production
echo MONGODB_URI=mongodb+srv://sitiranasir_db_user:sitgobu123@cluster0.eqsofth.mongodb.net/eduflow_lms?retryWrites=true&w=majority&appName=Cluster0
echo JWT_SECRET=8929b1ccde2b2b91caab92e9df628d6e40aec12850a6fccb06897fd4dc053f737cd61755900e01c2544498b6ccb5c75d3096c000c3ebdc5bbe290dcb2668201d
echo CLIENT_URL=https://online-learning-management-system-six.vercel.app
echo.
echo 🎯 After Railway deployment:
echo - Your backend will be at: https://your-app.railway.app
echo - Update your frontend API URL to point to Railway
echo - No more CORS issues!
echo.
echo ✅ Railway Benefits:
echo - Easier than Render
echo - Better free tier
echo - Auto-deploys from GitHub
echo - No complex configuration needed
echo.
pause