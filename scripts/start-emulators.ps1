$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
Set-Location ..
$taskJavaDirectory = Get-ChildItem -LiteralPath '.local-tools/java21' -Directory -ErrorAction SilentlyContinue | Select-Object -First 1
if ($taskJavaDirectory) { $env:JAVA_HOME = $taskJavaDirectory.FullName; $env:PATH = (Join-Path $taskJavaDirectory.FullName 'bin') + ';' + $env:PATH }
if (-not (Get-Command java -ErrorAction SilentlyContinue)) { throw 'Instala Java 21 o prepara .local-tools/java21 antes de iniciar.' }
$env:FIREBASE_CLI_DISABLE_UPDATE_CHECK = 'true'
$localConfigDirectory = Join-Path (Get-Location) '.local-tools/config'
New-Item -ItemType Directory -Force -Path $localConfigDirectory | Out-Null
$env:XDG_CONFIG_HOME = $localConfigDirectory
node node_modules/firebase-tools/lib/bin/firebase.js emulators:start --config firebase.local.json --project demo-binlegal-local --only auth,firestore,storage
