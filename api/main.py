from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import logging
import os
import numpy as np
import pandas as pd
from data import preprocess_input  # Import the preprocess_input from data.py

# Set up basic logging configuration
logging.basicConfig(level=logging.INFO)

# Load the label encoder and model from pickle files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, 'housing_data', 'housing_demand_model.pkl')  # Path to model
encoder_path = os.path.join(BASE_DIR, 'housing_data', 'label_encoder.pkl')  # Path to encoder
properties_path = os.path.join(BASE_DIR, 'housing_data', 'Final_Demand_Prediction_With_Amenities.csv')

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

@app.post("/predict")
def predict(req: PredictionRequest):
    try:
        user_bhk = req.bhk
        user_location = req.location.strip()
        user_gym = req.gym.strip().lower()
        user_pool = req.pool.strip().lower()

        # Encode location
        matched_location = next((loc for loc in label_encoder.classes_ if loc.lower() == user_location.lower()), None)
        encoded_location = label_encoder.transform([matched_location])[0] if matched_location else -1

        df_filtered = df_properties.copy()

        # 1. Filter by location if valid
        if encoded_location != -1:
            df_filtered = df_filtered[df_filtered['Location'] == encoded_location]

        # 2. Filter by BHK
        df_filtered = df_filtered[df_filtered['BHK'] == user_bhk]

        # 3. Filter by gym & pool
        gym_val = 1 if user_gym == "yes" else 0
        pool_val = 1 if user_pool == "yes" else 0

        df_filtered = df_filtered[
            (df_filtered['Gym Available'] == gym_val) &
            (df_filtered['Swimming Pool Available'] == pool_val)
        ]

        # RELAX filters if empty
        if df_filtered.empty:
            df_filtered = df_properties[df_properties['BHK'] == user_bhk]

        if df_filtered.empty:
            df_filtered = df_properties.copy()
            if encoded_location != -1:
                df_filtered = df_filtered[df_filtered['Location'] == encoded_location]

        if df_filtered.empty:
            df_filtered = df_properties.copy()

        # Estimate Rent
        def estimate_rent(row, max_price):
            rent = 0
            if row['BHK'] == 1:
                rent = np.random.randint(7000, 15000)
            elif row['BHK'] == 2:
                rent = np.random.randint(13000, 20000) if (row['Gym Available'] == 0 or row['Swimming Pool Available'] == 0) else np.random.randint(20000, 25000)
            elif row['BHK'] == 3:
                rent = np.random.randint(20000, 35000)
            if row['Gym Available'] == 1:
                rent *= 1.05
            if row['Swimming Pool Available'] == 1:
                rent *= 1.07
            price_factor = (row['Average Price'] / max_price)
            rent = rent * (1 + price_factor * 0.1)
            return int(rent)

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

        # Add derived columns
        max_price = df_filtered['Average Price'].max()
        df_filtered['Estimated Rent'] = df_filtered.apply(lambda r: estimate_rent(r, max_price), axis=1)
        max_rent = df_filtered['Estimated Rent'].max()
        df_filtered['Demand Score'] = df_filtered.apply(lambda r: calculate_demand_score(r, max_price, max_rent), axis=1)

        # Star rating normalization
        min_score = df_filtered['Demand Score'].min()
        max_score = df_filtered['Demand Score'].max()
        if max_score != min_score:
            df_filtered['Star Rating'] = 5 * (df_filtered['Demand Score'] - min_score) / (max_score - min_score)
        else:
            df_filtered['Star Rating'] = 3

        # Final selection
        df_filtered = df_filtered.sort_values(by='Demand Score', ascending=False).head(10)

        # Prepare result
        result = df_filtered[['Society Name', 'Location', 'Average Price', 'BHK', 'Gym Available', 'Swimming Pool Available', 'Estimated Rent', 'Star Rating']]
        result = result.rename(columns={"Average Price": "Price"})

        return {"properties": result.to_dict(orient="records")}

    except Exception as e:
        logging.error(f"Prediction error: {str(e)}")
        return {"error": str(e)}
