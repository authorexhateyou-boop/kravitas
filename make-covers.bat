@echo off
cd /d "%~dp0"
echo Making template covers with your fal.ai key (.env)...
echo.
node scripts\make-template-covers.mjs %*
echo.
pause
