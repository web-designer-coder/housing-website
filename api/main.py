from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import logging
import os
import numpy as np
import pandas as pd

# Set up basic logging configuration
logging.basicConfig(level=logging.INFO)

# Load the label encoder and model from pickle files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, 'housing_data', 'housing_demand_model.pkl')  # Path to model
encoder_path = os.path.join(BASE_DIR, 'housing_data', 'label_encoder.pkl')  # Path to encoder
properties_path = r'C:\Users\aryan\Downloads\CEP_3\api\housing_data\Final_Demand_Prediction_With_Amenities.csv'  # Path to CSV

model = joblib.load(model_path)
label_encoder = joblib.load(encoder_path)

# Load the properties data (make sure to load it once to avoid loading it repeatedly)
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
        loc_encoded = label_encoder.transform([req.location])[0] if req.location in label_encoder.classes_ else -1
        
        # Convert RERA flag to binary (1/0)
        rera_val = 1 if req.rera else 0
        
        # Convert Gym and Pool to binary (1/0)
        gym_val = 1 if req.gym.lower() == "yes" else 0
        pool_val = 1 if req.pool.lower() == "yes" else 0
        
        # Filter properties based on input parameters
        filtered_properties = df_properties[
            (df_properties['BHK'] == req.bhk) &
            (df_properties['Gym Available'] == gym_val) &
            (df_properties['Swimming Pool Available'] == pool_val)
        ]
        
        # If location is valid, filter properties by location
        if loc_encoded != -1:
            filtered_properties = filtered_properties[filtered_properties['Location'] == loc_encoded]
        
        # Return filtered properties with relevant details (like name, location, price, etc.)
        result = filtered_properties[['Society Name', 'Location', 'Price', 'Gym Available', 'Swimming Pool Available', 'Star Rating', 'Estimated Rent']]

        # Check if any properties were found
        if result.empty:
            return {"error": "No matching properties found."}

        # Return results as a list of dictionaries for easy frontend processing
        return {"properties": result.to_dict(orient="records")}
    
    except Exception as e:
        logging.error(f"Error: {str(e)}")
        return {"error": str(e)}
