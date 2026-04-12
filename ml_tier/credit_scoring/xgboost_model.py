import xgboost as xgb
import shap
import pandas as pd
import numpy as np

class DynamicCreditModel:
    def __init__(self):
        self.model = xgb.XGBRegressor(
            objective='reg:squarederror',
            n_estimators=100,
            learning_rate=0.1,
            max_depth=5
        )
        self.explainer = None

    def train(self, X: pd.DataFrame, y: pd.Series):
        """Train the model and initialize SHAP explainer."""
        self.model.fit(X, y)
        self.explainer = shap.TreeExplainer(self.model)

    def predict_with_explanation(self, X_instance: pd.DataFrame):
        """Returns the credit limit prediction and its SHAP explanation."""
        pred = self.model.predict(X_instance)[0]
        if self.explainer:
            shap_values = self.explainer.shap_values(X_instance)
            return {"prediction": float(pred), "shap_values": shap_values[0].tolist()}
        return {"prediction": float(pred), "shap_values": None}

if __name__ == "__main__":
    print("XGBoost Credit Scoring Engine initialised.")
