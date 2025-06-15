@echo off
echo Uruchamianie backendu...
start cmd /k "cd Backend/Backend && dotnet run"

echo Uruchamianie frontendu...
start cmd /k "cd Frontend && npm run dev"

