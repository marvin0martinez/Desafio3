@echo off
echo ====================================
echo    NOVATECH - WAMPSERVER SETUP
echo ====================================

echo 1. Verificando WampServer...
wmic process where "name='wampmanager.exe'" get processid 2>nul | findstr /r [0-9] >nul
if %errorlevel% neq 0 (
    echo ERROR: WampServer no esta ejecutandose
    echo Por favor inicia WampServer manualmente
    pause
    exit /b 1
)

echo 2. Iniciando Backend Spring Boot...
cd backend
start "NovaTech Backend" mvn spring-boot:run

echo Esperando 15 segundos para que el backend inicie...
timeout /t 15

echo 3. Iniciando Frontend...
cd ..\frontend
start "NovaTech Frontend" python -m http.server 8000

echo ====================================
echo        APLICACION LISTA
echo ====================================
echo Backend:  http://localhost:8080
echo Frontend: http://localhost:8000
echo phpMyAdmin: http://localhost/phpmyadmin
echo ====================================
echo Usuarios de prueba:
echo Admin: admin@novatech.com / admin123
echo User:  user@novatech.com / user123
echo ====================================
echo Presiona cualquier tecla para cerrar...
pause >nul