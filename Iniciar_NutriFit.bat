@echo off
setlocal
title NutriFit
cd /d "%~dp0"
set "NODE_TLS_REJECT_UNAUTHORIZED=0"

:: 1. Limpiar perfiles antiguos conflictivos si existieran
if exist "%LOCALAPPDATA%\NutriFitProfile" (
    rmdir /s /q "%LOCALAPPDATA%\NutriFitProfile" >nul 2>&1
)

:: 2. Verificar si el servidor ya esta activo en el puerto 5000
curl.exe -s -m 1 http://127.0.0.1:5000/api/health >nul 2>&1
if errorlevel 1 (
    echo Iniciando servidor NutriFit...
    start "" /min "C:\Users\oscar\nodejs\node.exe" dist\server.js
    
    :wait_server
    ping 127.0.0.1 -n 2 >nul
    curl.exe -s -m 1 http://127.0.0.1:5000/api/health >nul 2>&1
    if errorlevel 1 goto wait_server
)

:: 3. Abrir ventana de aplicacion (Edge prioritario por ser navegador nativo de Windows 11 sin pantallas en blanco, o Chrome)
set "APP_URL=http://127.0.0.1:5000"

if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app=%APP_URL%
) else if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --app=%APP_URL%
) else (
    start %APP_URL%
)

exit
