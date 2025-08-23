@echo off
echo Starting Scholargy Backend...
echo.

cd ..\scholargy-backend

echo Checking if .env file exists...
if not exist .env (
    echo ERROR: .env file not found!
    echo Please create a .env file with the required environment variables.
    echo See BACKEND_SETUP.md for details.
    pause
    exit /b 1
)

echo Installing dependencies...
call npm install

echo Starting backend server...
call npm start

pause
