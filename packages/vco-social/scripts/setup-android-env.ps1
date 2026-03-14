# setup-android-env.ps1
# Detects Android SDK/NDK and sets environment variables for PowerShell.

Write-Host "🔍 Detecting Android environment..."

# 1. Common SDK Paths
$SDK_PATHS = @(
    "$env:LOCALAPPDATA\Android\Sdk",
    "$env:USERPROFILE\Android\Sdk"
)

$DETECTED_SDK = ""
foreach ($path in $SDK_PATHS) {
    if (Test-Path $path) {
        $DETECTED_SDK = $path
        break
    }
}

if (-not $DETECTED_SDK) {
    Write-Host "❌ Error: Android SDK not found in common locations." -ForegroundColor Red
    $DETECTED_SDK = Read-Host "Please specify your SDK path"
}

if (-not (Test-Path $DETECTED_SDK)) {
    Write-Host "❌ Error: Path $DETECTED_SDK does not exist." -ForegroundColor Red
    exit 1
}

Write-Host "✅ SDK Found: $DETECTED_SDK" -ForegroundColor Green

# 2. Detect NDK
$DETECTED_NDK = ""
if (Test-Path "$DETECTED_SDK\ndk") {
    $LATEST_NDK = Get-ChildItem "$DETECTED_SDK\ndk" | Sort-Object Name -Descending | Select-Object -First 1
    if ($LATEST_NDK) {
        $DETECTED_NDK = $LATEST_NDK.FullName
    }
} elseif (Test-Path "$DETECTED_SDK\ndk-bundle") {
    $DETECTED_NDK = "$DETECTED_SDK\ndk-bundle"
}

if ($DETECTED_NDK) {
    Write-Host "✅ NDK Found: $DETECTED_NDK" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: NDK not found in SDK folder." -ForegroundColor Yellow
}

# 3. Detect Shell Profile
$PROFILE_PATH = $PROFILE
Write-Host "🐚 Shell: PowerShell"
Write-Host "📝 Target Profile: $PROFILE_PATH"

# 4. Generate configuration
$CONFIG_BLOCK = @"

# --- VCO Android Development Env ---
`$env:ANDROID_HOME = "$DETECTED_SDK"
`$env:ANDROID_SDK_ROOT = "$DETECTED_SDK"
"@

if ($DETECTED_NDK) {
    $CONFIG_BLOCK += "`n`$env:ANDROID_NDK_HOME = `"$DETECTED_NDK`""
}

$CONFIG_BLOCK += "`n`$env:Path += `";`$env:ANDROID_HOME\cmdline-tools\latest\bin;`$env:ANDROID_HOME\platform-tools`"`n# -----------------------------------"

Write-Host "`n🚀 Suggested environment variables:"
Write-Host "--------------------------------------------------"
Write-Host $CONFIG_BLOCK
Write-Host "--------------------------------------------------"

$response = Read-Host "`nWould you like to append this configuration to your PowerShell profile? (y/n)"

if ($response -eq "y" -or $response -eq "yes") {
    if (-not (Test-Path $PROFILE_PATH)) {
        New-Item -Path $PROFILE_PATH -Type File -Force
    }
    Add-Content -Path $PROFILE_PATH -Value $CONFIG_BLOCK
    Write-Host "✅ Configuration appended to $PROFILE_PATH." -ForegroundColor Green
    Write-Host "👉 Restart your terminal to apply changes."
} else {
    Write-Host "ℹ️  No changes made. You can manually copy the block above."
}
