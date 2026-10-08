@echo off
chcp 65001 >nul
title Learn With Younis - Video Generator
echo ======================================================
echo    Learn With Younis - Video Generator (1080p)
echo ======================================================
echo.

cd /d "%~dp0"
node scripts/create-video.js %1

echo.
echo ======================================================
echo اضغط اي زر للخروج...
pause >nul
