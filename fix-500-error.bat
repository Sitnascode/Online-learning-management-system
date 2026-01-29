@echo off
echo 🔧 EduFlow LMS - Fixing 500 Error and API Issues
echo ===============================================

echo.
echo 📦 Adding fixed files...
git add client/index.html
git add server/index.js

echo.
echo 💾 Committing fixes...
git commit -m "Fix: Remove manifest.json reference and improve CORS configuration"

echo.
echo 📤 Pushing fixes to GitHub...
git push origin main

echo.
echo ✅ Code fixes pushed! 
echo.
echo 🚨 CRITICAL: You MUST update environment variables:
echo.
echo 📋 In Render (Backend):
echo Go to: https://dashboard.render.com
echo 1. Find your backend service
echo 2. Go to Environment tab
echo 3. Set these variables:
echo    CLIENT_URL=https://eduflowlms-psi.vercel.app
echo    MONGODB_URI=mongodb+srv://sitiranasir_db_user:sitgobu123@cluster0.eqsofth.mongodb.net/eduflow_lms?retryWrites=true&w=majority&appName=Cluster0
echo    JWT_SECRET=8929b1ccde2b2b91caab92e9df628d6e40aec12850a6fccb06897fd4dc053f737cd61755900e01c2544498b6ccb5c75d3096c000c3ebdc5bbe290dcb2668201d
echo    NODE_ENV=production
echo.
echo 📋 In Vercel (Frontend):
echo Go to: https://vercel.com/dashboard
echo 1. Find your frontend project
echo 2. Go to Settings → Environment Variables
echo 3. Add this variable:
echo    VITE_API_URL=https://online-learning-management-system-he6h.onrender.com/api
echo 4. Redeploy your frontend
echo.
echo 🔍 After updating variables:
echo 1. Wait 2-3 minutes for services to restart
echo 2. Test: https://online-learning-management-system-he6h.onrender.com/health
echo 3. Should return: {"status":"OK",...}
echo 4. Test registration on your frontend
echo.
echo 📞 If still getting 500 errors:
echo 1. Check Render logs for database connection errors
echo 2. Verify MongoDB Atlas IP whitelist includes 0.0.0.0/0
echo 3. Test database connection in Render shell
echo.
pause