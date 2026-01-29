@echo off
echo 🎨 EduFlow LMS - Adding Favicon and Updating Deployment
echo =====================================================

echo.
echo 📦 Adding favicon files...
git add client/public/favicon.svg
git add client/public/manifest.json
git add client/public/favicon-32.png
git add client/public/favicon-16.png
git add client/public/apple-touch-icon.png
git add client/index.html

echo.
echo 💾 Committing favicon changes...
git commit -m "Add favicon and app icons for EduFlow LMS"

echo.
echo 📤 Pushing to GitHub...
git push origin main

echo.
echo ✅ Favicon added and pushed to GitHub!
echo.
echo 🚀 Your deployments will automatically update:
echo   - Vercel (Frontend): Will redeploy automatically
echo   - Render (Backend): No changes needed
echo.
echo 🎯 Your new favicon features:
echo   - Education-themed graduation cap icon
echo   - Blue gradient background matching your brand
echo   - Multiple sizes for different devices
echo   - Web app manifest for mobile
echo   - SEO-optimized meta tags
echo.
pause