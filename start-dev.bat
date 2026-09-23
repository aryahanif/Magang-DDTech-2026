@echo off
title Atlas - Run All
echo ===================================================
echo   Starting Atlas Backend and Frontend...
echo ===================================================
start "Atlas Backend" cmd /k "cd atlas-backend && npm run start:dev"
start "Atlas Frontend" cmd /k "cd atlas-frontend && npm run dev"
echo Both Backend and Frontend have been launched in separate windows!
