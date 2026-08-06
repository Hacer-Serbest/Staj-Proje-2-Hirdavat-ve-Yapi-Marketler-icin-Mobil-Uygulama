# baslat.ps1 - Hirdavat projesini baslatir: Django sunucusu + Cloudflare tuneli
# ve mobil uygulamanin .env dosyasindaki API adresini otomatik gunceller.
#
# Kullanim: Bu klasorde (hirdavat) sag tik -> "PowerShell'de calistir"
# ya da: powershell -ExecutionPolicy Bypass -File baslat.ps1

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$apiDir = Join-Path $root "hirdavat-api"
$mobileEnvPath = Join-Path $root "hirdavat-mobile\.env"
$cloudflared = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
$tunnelLog = Join-Path $env:TEMP "hirdavat_tunnel.log"

if (-not (Test-Path $cloudflared)) {
    Write-Host "HATA: cloudflared bulunamadi ($cloudflared). Kurulum: winget install --id Cloudflare.cloudflared" -ForegroundColor Red
    exit 1
}

if (Test-Path $tunnelLog) { Remove-Item $tunnelLog -Force }

Write-Host "1/3 Django sunucusu baslatiliyor..." -ForegroundColor Cyan
Start-Process -FilePath "$apiDir\venv\Scripts\python.exe" `
    -ArgumentList "manage.py", "runserver", "0.0.0.0:8000" `
    -WorkingDirectory $apiDir -WindowStyle Minimized

Start-Sleep -Seconds 3

Write-Host "2/3 Cloudflare tuneli baslatiliyor (bu birkac saniye surebilir)..." -ForegroundColor Cyan

$url = $null
$tunnelAttempt = 0
while (-not $url -and $tunnelAttempt -lt 3) {
    $tunnelAttempt++
    if (Test-Path $tunnelLog) { Remove-Item $tunnelLog -Force }

    $proc = Start-Process -FilePath $cloudflared `
        -ArgumentList "tunnel", "--url", "http://localhost:8000" `
        -RedirectStandardError $tunnelLog -WindowStyle Hidden -PassThru

    $waitAttempts = 0
    while (-not $url -and $waitAttempts -lt 20) {
        Start-Sleep -Seconds 1
        if (Test-Path $tunnelLog) {
            $content = Get-Content $tunnelLog -Raw -ErrorAction SilentlyContinue
            # Gercek tunel adresleri her zaman "kelime-kelime-kelime.trycloudflare.com" seklindedir (tireli).
            # "api.trycloudflare.com" Cloudflare'in kendi ic adresidir, tunel adresi degildir.
            if ($content -match "https://[a-zA-Z0-9]+-[a-zA-Z0-9\-]+\.trycloudflare\.com") {
                $url = $matches[0]
            }
        }
        $waitAttempts++
    }

    if (-not $url) {
        Write-Host "  Tunel isteği zaman asimina ugradi, tekrar deneniyor ($tunnelAttempt/3)..." -ForegroundColor DarkYellow
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    }
}

if (-not $url) {
    Write-Host "HATA: Tunel adresi alinamadi (3 deneme). Log dosyasina bak: $tunnelLog" -ForegroundColor Red
    exit 1
}

Write-Host "3/3 Mobil uygulamanin .env dosyasi guncelleniyor..." -ForegroundColor Cyan
$envLines = Get-Content $mobileEnvPath
$newLines = $envLines | ForEach-Object {
    if ($_ -match "^EXPO_PUBLIC_API_BASE_URL=") { "EXPO_PUBLIC_API_BASE_URL=$url/api" } else { $_ }
}
Set-Content -Path $mobileEnvPath -Value $newLines -Encoding utf8

Write-Host ""
Write-Host "Hazir! Tunel adresi: $url" -ForegroundColor Green
Write-Host ""
Write-Host "Simdi baska bir terminal penceresinde hirdavat-mobile klasorune gir ve calistir:" -ForegroundColor Yellow
Write-Host "  npx expo start -c" -ForegroundColor Yellow
Write-Host ""
Write-Host "(Bu pencereyi kapatirsan sunucu ve tunel de kapanir.)" -ForegroundColor DarkGray
