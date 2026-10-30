$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
Set-Location ..
$taskJavaAssets = Invoke-RestMethod -Uri 'https://api.adoptium.net/v3/assets/latest/21/hotspot?architecture=x64&image_type=jre&os=windows&vendor=eclipse'
$taskJavaPackage = $taskJavaAssets[0].binary.package
New-Item -ItemType Directory -Force -Path '.local-tools' | Out-Null
$taskJavaPackage | ConvertTo-Json | Set-Content -LiteralPath '.local-tools/java-package.json'
Invoke-WebRequest -Uri $taskJavaPackage.link -OutFile '.local-tools/java21.zip'
if ((Get-FileHash -LiteralPath '.local-tools/java21.zip' -Algorithm SHA256).Hash.ToLowerInvariant() -ne $taskJavaPackage.checksum) { throw 'La verificación SHA256 de Java no coincide.' }
Expand-Archive -LiteralPath '.local-tools/java21.zip' -DestinationPath '.local-tools/java21' -Force
Write-Output 'Java 21 portátil preparado en .local-tools/java21. No modifica la instalación global.'
