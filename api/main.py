from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import logging
import os
import numpy as np
import pandas as pd
from data import preprocess_input  # Import updated preprocessing function

# Set up basic logging configuration
logging.basicConfig(level=logging.INFO)

# Load model and encoder from pickle files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, 'housing_data', 'housing_demand_model.pkl')  # Path to model
encoder_path = os.path.join(BASE_DIR, 'housing_data', 'label_encoder.pkl')  # Path to encoder
properties_path = os.path.join(BASE_DIR, 'housing_data', 'Final_Demand_Prediction_With_Amenities.csv')

# Load the model and label encoder
model = joblib.load(model_path)
label_encoder = joblib.load(encoder_path)

# Load the properties data (ensure to load it once to avoid repeated loading)
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

# POST route for predictions
@app.post("/predict")
def predict(req: PredictionRequest):
    try:
        # Preprocess input using the function from data.py
        filtered_properties = preprocess_input(req.location, req.bhk, req.rera, req.gym, req.pool)
        
        # Handle invalid location error
        if isinstance(filtered_properties, tuple) and filtered_properties[0] == -1:
            return {"error": filtered_properties[1]}  # Return error for invalid location
        
        # Return results if properties are found
        if filtered_properties.empty:
            return {"error": "No matching properties found."}

        # Return results as a list of dictionaries for easy frontend processing
        return {"properties": filtered_properties.to_dict(orient="records")}
    
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return {"error": str(e)}
