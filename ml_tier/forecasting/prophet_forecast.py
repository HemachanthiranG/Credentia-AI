import pandas as pd
from prophet import Prophet
import numpy as np
import logging

class CategoryForecaster:
    """Uses Facebook Prophet to overlay seasonal demand curves for overarching B2B categories to feed Model 3 Recs."""
    def __init__(self):
        self.models = {}
        
    def train_category(self, category_name: str, df_history: pd.DataFrame):
        """
        Expects a history DataFrame with 'ds' (datestamp) and 'y' (calculated categorical demand volume) columns.
        """
        logging.info(f"Training Prophet algorithmic seasonal model for {category_name}...")
        m = Prophet(yearly_seasonality=True, weekly_seasonality=True, daily_seasonality=False)
        m.fit(df_history)
        self.models[category_name] = m
        return m
        
    def predict_demand(self, category_name: str, periods=30):
        if category_name not in self.models:
            raise ValueError(f"Forecasting Model for {category_name} not yet trained or initialized.")
        
        m = self.models[category_name]
        future = m.make_future_dataframe(periods=periods)
        forecast = m.predict(future)
        # We output only what matters for the Recommendation N8N re-ranking engine limits
        return forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(periods)

if __name__ == "__main__":
    # Mock Validation
    df_mock = pd.DataFrame({
        'ds': pd.date_range(start='2024-01-01', periods=365, freq='D'),
        'y': np.random.randn(365).cumsum() + 100
    })
    forecaster = CategoryForecaster()
    forecaster.train_category("Electronics", df_mock)
    preds = forecaster.predict_demand("Electronics", periods=7)
    print("Prophet Forecast Matrix (Next 7 days):\n", preds.head())
