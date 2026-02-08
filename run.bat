@echo off
echo ================================
echo   Musahheh - Arabic Corrector
echo ================================
echo.

echo [92mInstalling requirements...[0m
pip install -q -r requirements.txt

echo.
echo [92mStarting server...[0m
cd backend
python app.py

pause
