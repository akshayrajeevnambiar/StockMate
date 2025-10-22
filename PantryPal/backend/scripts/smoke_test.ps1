# Smoke test for PantryPal backend
# Usage: pwsh .\scripts\smoke_test.ps1

$base = 'http://127.0.0.1:8000'

function Invoke-TryRequest {
    param(
        [ScriptBlock] $Script,
        [string] $Description
    )
    Write-Host "`n==> $Description" -ForegroundColor Cyan
    try {
        $result = & $Script
        if ($result -ne $null) {
            $result | ConvertTo-Json -Depth 5
        } else {
            Write-Host "(no content returned)"
        }
    } catch {
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 1) Root
Invoke-TryRequest -Script { Invoke-RestMethod -Uri "$base/" -Method GET } -Description "Root /"

# 2) Login (form)
$loginForm = @{ username = 'admin@pantrypal.local'; password = 'adminpassword' }
Invoke-TryRequest -Script {
    $resp = Invoke-RestMethod -Uri "$base/api/auth/login" -Method Post -Form $loginForm -ErrorAction Stop
    # save token to file for following tests
    $token = $resp.access_token
    if ($null -eq $token) { throw 'No access token returned' }
    Set-Content -Path .\scripts\.last_token -Value $token
    $resp
} -Description "POST /api/auth/login (admin)"

# 3) /me
if (Test-Path .\scripts\.last_token) {
    $token = Get-Content .\scripts\.last_token
    Invoke-TryRequest -Script { Invoke-RestMethod -Uri "$base/api/auth/me" -Method GET -Headers @{ Authorization = "Bearer $token" } } -Description "/api/auth/me"
} else {
    Write-Host "Skipping /me (no token)" -ForegroundColor Yellow
}

# 4) GET /api/items
Invoke-TryRequest -Script { Invoke-RestMethod -Uri "$base/api/items" -Method GET -Headers @{ Authorization = "Bearer $token" } } -Description "GET /api/items"

Write-Host "\nSmoke test finished." -ForegroundColor Green
