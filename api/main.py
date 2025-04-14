from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import logging
import os
import numpy as np
import pandas as pd
from data import preprocess_input  # Import from data.py

# Set up basic logging configuration
logging.basicConfig(level=logging.INFO)

# Load the label encoder and model from pickle files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, 'housing_data', 'housing_demand_model.pkl')  # Path to model
encoder_path = os.path.join(BASE_DIR, 'housing_data', 'label_encoder.pkl')  # Path to encoder
properties_path = os.path.join(BASE_DIR, 'housing_data', 'Final_Demand_Prediction_With_Amenities.csv')

# Load model and encoder with error handling
try:
    model = joblib.load(model_path)
    label_encoder = joblib.load(encoder_path)
except Exception as e:
    logging.error(f"Error loading model or encoder: {str(e)}")
    raise HTTPException(status_code=500, detail="Internal Server Error: Could not load model or encoder")

# Load properties data (ensure the file exists and is readable)
try:
    df_properties = pd.read_csv(properties_path)
except FileNotFoundError:
    logging.error(f"Properties data file not found at {properties_path}")
    raise HTTPException(status_code=500, detail="Internal Server Error: Properties data file missing")
except pd.errors.ParserError:
    logging.error(f"Error parsing CSV file at {properties_path}")
    raise HTTPException(status_code=500, detail="Internal Server Error: Could not parse properties data")

app = FastAPI()

# Allow CORS for all origins (adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictionRequest(BaseModel):
    bhk: int
    location: str
    rera: bool
    gym: str
    pool: str

@app.post("/predict")
def predict(req: PredictionRequest):
    try:
        # Validation of inputs
        if req.bhk not in [1, 2, 3]:
            raise HTTPException(status_code=400, detail="BHK value must be 1, 2, or 3")
        if req.gym not in ['yes', 'no']:
            raise HTTPException(status_code=400, detail="Gym must be 'yes' or 'no'")
        if req.pool not in ['yes', 'no']:
            raise HTTPException(status_code=400, detail="Pool must be 'yes' or 'no'")

        # Preprocess input and handle location encoding
        user_bhk = req.bhk
        user_location = req.location.strip().lower()
        user_gym = req.gym.strip().lower()
        user_pool = req.pool.strip().lower()

        matched_location = next((loc for loc in label_encoder.classes_ if loc.lower() == user_location), None)
        if matched_location is None:
            raise HTTPException(status_code=400, detail=f"Location '{user_location}' not found in the available data.")
        
        encoded_location = label_encoder.transform([matched_location])[0]

        # Filter properties based on user input
        df_filtered = df_properties.copy()

        # Apply filters
        df_filtered = df_filtered[df_filtered['Location'] == encoded_location]
        df_filtered = df_filtered[df_filtered['BHK'] == user_bhk]
        gym_val = 1 if user_gym == "yes" else 0
        pool_val = 1 if user_pool == "yes" else 0
        df_filtered = df_filtered[
            (df_filtered['Gym Available'] == gym_val) & 
            (df_filtered['Swimming Pool Available'] == pool_val)
        ]

        if df_filtered.empty:
            df_filtered = df_properties[df_properties['BHK'] == user_bhk]
        
        if df_filtered.empty:
            df_filtered = df_properties.copy()

        # Estimate Rent function
        def estimate_rent(row, max_price):
            rent = 0
            if row['BHK'] == 1:
                rent = np.random.randint(7000, 15000)
            elif row['BHK'] == 2:
                rent = np.random.randint(13000, 20000)
            elif row['BHK'] == 3:
                rent = np.random.randint(20000, 35000)
            if row['Gym Available'] == 1:
                rent *= 1.05
            if row['Swimming Pool Available'] == 1:
                rent *= 1.07
            price_factor = (row['Average Price'] / max_price)
            rent = rent * (1 + price_factor * 0.1)
            return int(rent)

        # Calculate demand score
        def calculate_demand_score(row, max_price, max_rent):
            score = 0
            price_factor = (max_price - row['Average Price']) / max_price
            rent_factor = (max_rent - row['Estimated Rent']) / max_rent
            score += price_factor * 3 + rent_factor * 2
            if gym_val == 0 and row['Gym Available'] == 0:
                score += 1
            if pool_val == 0 and row['Swimming Pool Available'] == 0:
                score += 1
            if row['Gym Available'] == 1:
                score += 1
            if row['Swimming Pool Available'] == 1:
                score += 1
            return score

        # Add derived columns for estimated rent and demand score
        max_price = df_filtered['Average Price'].max()
        df_filtered['Estimated Rent'] = df_filtered.apply(lambda r: estimate_rent(r, max_price), axis=1)
        max_rent = df_filtered['Estimated Rent'].max()
        df_filtered['Demand Score'] = df_filtered.apply(lambda r: calculate_demand_score(r, max_price, max_rent), axis=1)

        # Normalize Star Rating
        min_score = df_filtered['Demand Score'].min()
        max_score = df_filtered['Demand Score'].max()
        if max_score != min_score:
            df_filtered['Star Rating'] = 5 * (df_filtered['Demand Score'] - min_score) / (max_score - min_score)
        else:
            df_filtered['Star Rating'] = 3

        # Sort and select the top 10 properties
        df_filtered = df_filtered.sort_values(by='Demand Score', ascending=False).head(10)

        # Prepare the final result
        result = df_filtered[['Society Name', 'Location', 'Average Price', 'BHK', 'Gym Available', 'Swimming Pool Available', 'Estimated Rent', 'Star Rating']]
        result = result.rename(columns={"Average Price": "Price"})

        return {"properties": result.to_dict(orient="records")}

    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error: " + str(e))
