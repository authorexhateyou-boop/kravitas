@echo off
cd /d "%~dp0"
echo Making real pictures and short clips for the 9 landing page cards...
echo This uses your fal.ai key in .env (about US$1.50 in total).
echo.
node scripts\make-template-covers.mjs --nine --video
echo.
echo Finished. Pictures are in public\tpl. Restart Kravitas and open the landing page.
pause
