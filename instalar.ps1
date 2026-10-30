$dir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $dir
$env:PATH = "C:\Users\oscar\nodejs;$env:PATH"
$env:NODE_TLS_REJECT_UNAUTHORIZED = "0"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host "       INSTALADOR DE NUTRIFIT PARA WINDOWS" -ForegroundColor Yellow
Write-Host "    Contador de Calorias y Macros (Estilo Fitia)" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Yellow
Write-Host ""

# Build distribution if not already built
if (-not (Test-Path "$dir\dist\index.html")) {
    Write-Host "[1/2] Compilando aplicacion para produccion..." -ForegroundColor Cyan
    & "C:\Users\oscar\nodejs\npm.cmd" run build
} else {
    Write-Host "[1/2] Compilacion verificada." -ForegroundColor Green
}

# Create Desktop Shortcut
Write-Host "[2/2] Creando acceso directo en el Escritorio..." -ForegroundColor Cyan
$wsh = New-Object -ComObject WScript.Shell
$desktop = [Environment]::GetFolderPath("Desktop")
$shortcut = $wsh.CreateShortcut("$desktop\NutriFit.lnk")
$shortcut.TargetPath = "wscript.exe"
$shortcut.Arguments = "`"$dir\Iniciar_NutriFit.vbs`""
$shortcut.WorkingDirectory = $dir
$shortcut.IconLocation = "$dir\icon.ico"
$shortcut.Description = "NutriFit - Control de Calorias y Macros"
$shortcut.Save()

# Create Start Menu Shortcut
$startMenu = [Environment]::GetFolderPath("StartMenu")
$menuFolder = "$startMenu\Programs"
if (Test-Path $menuFolder) {
    $menuShortcut = $wsh.CreateShortcut("$menuFolder\NutriFit.lnk")
    $menuShortcut.TargetPath = "wscript.exe"
    $menuShortcut.Arguments = "`"$dir\Iniciar_NutriFit.vbs`""
    $menuShortcut.WorkingDirectory = $dir
    $menuShortcut.IconLocation = "$dir\icon.ico"
    $menuShortcut.Description = "NutriFit - Control de Calorias y Macros"
    $menuShortcut.Save()
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  INSTALACION COMPLETADA CON EXITO!" -ForegroundColor Green
Write-Host "  Se ha creado el icono 'NutriFit' en tu Escritorio." -ForegroundColor Green
Write-Host "  Abriendo NutriFit en ventana nativa independiente..." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

Start-Process "wscript.exe" -ArgumentList "`"$dir\Iniciar_NutriFit.vbs`""
Start-Sleep -Seconds 2
