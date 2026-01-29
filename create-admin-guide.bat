@echo off
echo 👤 EduFlow LMS - Create Admin Account
echo ==================================

echo.
echo 🔑 To access the admin panel, you need to create an admin account first.
echo.
echo 📋 Option 1 - If you have backend access (Railway/Render):
echo 1. Go to your Railway/Render dashboard
echo 2. Open the terminal/shell for your backend service
echo 3. Run: npm run create-admin
echo 4. Follow the prompts to create admin account
echo.
echo 📋 Option 2 - Run locally:
echo 1. Make sure your .env has the correct MONGODB_URI
echo 2. Run: node scripts/create-admin.js
echo 3. Follow the prompts
echo.
echo 🌐 Admin URLs:
echo Login: https://online-learning-management-system-six.vercel.app/admin-login
echo Dashboard: https://online-learning-management-system-six.vercel.app/dashboard
echo Instructors: https://online-learning-management-system-six.vercel.app/admin/instructors
echo.
echo 📝 Default Admin Credentials (if you haven't created custom ones):
echo Email: admin@eduflow.com
echo Password: admin123
echo.
echo ⚠️  Change the default password after first login!
echo.
pause