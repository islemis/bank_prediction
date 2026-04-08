from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
from tensorflow.keras.models import load_model
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(title="Bank Prediction API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# ======================
# Charger le modèle et le préprocesseur
# ======================
model = load_model("models/nn_model.keras")  # ton modèle Keras
preprocessor = joblib.load("models/preprocessor.pkl")  # préprocesseur enregistré

# ======================
# Créer l'API FastAPI
# ======================

# ======================
# Définir le format des données d'entrée
# ======================
class BankData(BaseModel):
    age: int
    job: str
    marital: str
    education: str
    default: str
    balance: int
    housing: str
    loan: str
    contact: str
    campaign: int
    previous: int
    poutcome: str

# ======================
# Endpoint de prédiction
# ======================
@app.post("/predict")
def predict(data: BankData):
    # Convertir en DataFrame
    df = pd.DataFrame([data.dict()])
    
    X_trans = preprocessor.transform(df)
    
    y_prob = model.predict(X_trans)
    y_pred = (y_prob > 0.5).astype(int)
    
    return {
        "prediction": int(y_pred[0][0]),
        "probability": float(y_prob[0][0])
    }

