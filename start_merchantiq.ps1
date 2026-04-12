Write-Host "========================================" -ForegroundColor Magenta
Write-Host "   MERCHANT IQ - SYSTEM BOOTSTRAPPER    " -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta

# 1. Start Docker Infrastructure
Write-Host "`n[1/4] Booting Enterprise Infrastructure Container Stack..." -ForegroundColor Cyan
Write-Host "      - PostgreSQL, MongoDB, Redis, Confluent Kafka, Metabase" -ForegroundColor DarkGray
docker-compose up -d

# 2. Check Virtual Environment and Train Models if needed
Write-Host "`n[2/4] Verifying Machine Learning Checkpoints..." -ForegroundColor Cyan
if (-not (Test-Path "ml_tier\saved_models\xgboost_credit_model.pkl")) {
    Write-Host "      [!] Untrained models detected. Initializing data fusion and XGBoost/LSTM training..." -ForegroundColor Yellow
    & .\venv\Scripts\python.exe train_models.py
} else {
    Write-Host "      - Machine Learning Models (XGBoost/LSTM) are already trained and serialized." -ForegroundColor Green
}

# 3. Start Backend FastAPI Server (runs Kafka scoring loops in background)
Write-Host "`n[3/4] Ignition of AI Agent Router and FastAPI Framework..." -ForegroundColor Cyan
Write-Host "      - Ensure GROQ_API_KEY is placed in your environment variables for LLaMA 3.1" -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit -Command `"cd $($PWD.Path); .\venv\Scripts\activate; uvicorn backend.main:app --reload`""

# 4. Start React Frontend
Write-Host "`n[4/4] Serving React+Vite Frontend Dashboard..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd $($PWD.Path)\frontend; npm run dev`""

# 5. Optional: Start Live Simulation
Write-Host "`n[BONUS] Launching Live Transaction Simulator..." -ForegroundColor Magenta
Write-Host "      - This will pump synthetic data into Kafka to trigger the ML Scoring Engine." -ForegroundColor DarkGray
Start-Process powershell -ArgumentList "-NoExit -Command `"cd $($PWD.Path); .\venv\Scripts\activate; python -m data_pipeline.transaction_simulator`""

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "   MERCHANT IQ SUCCESSFULLY ONLINE!     " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "-> Dashboard Interface: http://localhost:5173"
Write-Host "-> Swagger Backend API: http://localhost:8000/docs"
Write-Host "-> Metabase BI Server:  http://localhost:3000"
