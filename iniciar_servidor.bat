@echo off
cd /d "%~dp0"
if exist "dist\server.js" (
    "C:\Users\oscar\nodejs\node.exe" dist\server.js
) else (
    "C:\Users\oscar\nodejs\node.exe" node_modules\tsx\dist\cli.mjs server\index.ts
)
