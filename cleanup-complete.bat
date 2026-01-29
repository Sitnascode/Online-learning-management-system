@echo off
echo 🧹 EduFlow LMS - Repository Cleanup Complete
echo ==========================================

echo.
echo ✅ Deleted unwanted files:
echo - All deployment script files (.bat)
echo - Test and temporary files
echo - Old configuration files (ecosystem.config.js, render.yaml, railway.json, Procfile)
echo - Placeholder favicon files
echo - GitHub Pages docs directory
echo - Temporary CORS fix files
echo.
echo 📦 Adding cleanup changes...
git add .
git add -u

echo.
echo 💾 Committing repository cleanup...
git commit -m "Clean up repository: Remove unwanted deployment scripts, test files, and temporary files"

echo.
echo 📤 Pushing cleanup to GitHub...
git push origin main

echo.
echo ✅ Repository cleanup complete!
echo.
echo 📋 Remaining essential files:
echo ✅ client/ - React frontend
echo ✅ server/ - Node.js backend  
echo ✅ database/ - Database schemas
echo ✅ scripts/ - Admin creation script
echo ✅ assets/ - CSS and JS assets
echo ✅ package.json - Dependencies
echo ✅ .env.example - Environment template
echo ✅ .gitignore - Git ignore rules
echo ✅ README.md - Documentation
echo.
echo 🎯 Your repository is now clean and production-ready!
echo.
pause