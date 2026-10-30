$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
Set-Location ..
$env:FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080'
$env:FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199'
node scripts/test-emulator-rules.mjs
