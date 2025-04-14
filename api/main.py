from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import logging
import os
import pandas as pd
from data import get_recommendations  # Correct import from data.py

# Set up basic logging configuration
logging.basicConfig(level=logging.INFO)

# Load the label encoder and model from pickle files (if needed)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, 'housing_data', 'housing_demand_model.pkl')  # Path to model
encoder_path = os.path.join(BASE_DIR, 'housing_data', 'label_encoder.pkl')  # Path to encoder

model = joblib.load(model_path)
label_encoder = joblib.load(encoder_path)

# Load the properties data (make sure to load it once to avoid loading it repeatedly)
properties_path = os.path.join(BASE_DIR, 'housing_data', 'Final_Demand_Prediction_With_Amenities.csv')
df_properties = pd.read_csv(properties_path)

app = FastAPI()

# Allow CORS for all origins (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define input model using Pydantic (5 parameters only)
class PredictionRequest(BaseModel):
    bhk: int
    location: str
    rera: bool
    gym: str
    pool: str

@app.post("/predict")
def predict(req: PredictionRequest):
    try:
        # Extracting data from the request
        user_bhk = req.bhk
        user_location = req.location.strip()
        user_gym = req.gym.strip().lower()
        user_pool = req.pool.strip().lower()

        # Get recommendations from the data.py module
        properties = get_recommendations(user_location, user_bhk, req.rera, user_gym, user_pool)

        # Check if any properties were returned
        if not properties:
            return {"error": "No properties found matching the criteria."}

        # Return the properties as the response
        return {"properties": properties}

    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        return {"error": str(e)}
