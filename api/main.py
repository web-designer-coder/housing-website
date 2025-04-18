from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os
import logging
from data import yes_no_to_binary

logging.basicConfig(level=logging.INFO)

app = FastAPI()

# Load resources
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, 'housing_data', 'housing_demand_model.pkl')
encoder_path = os.path.join(BASE_DIR, 'housing_data', 'label_encoder.pkl')
csv_path = os.path.join(BASE_DIR, 'housing_data', 'Final_Demand_Prediction_With_Amenities.csv')

model = joblib.load(model_path)
label_encoder = joblib.load(encoder_path)
df_properties = pd.read_csv(csv_path)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Input model
class PredictionRequest(BaseModel):
    bhk: int
    location: str
    rera: bool
    gym: str
    pool: str

@app.post("/predict")
def predict(req: PredictionRequest):
    try:
        logging.info(f"Incoming request: {req.dict()}")

        # Get input parameters
        bhk = f"{req.bhk} BHK"
        location = req.location.strip().lower()
        gym = yes_no_to_binary(req.gym)
        pool = yes_no_to_binary(req.pool)
        rera = "Registered" if req.rera else "Not Registered"

        # Start with a copy of the properties DataFrame
        df = df_properties.copy()

        # Apply initial filters based on the input
        df = df[df['Location'].str.lower() == location]

        # Safely filter by RERA column
        if 'RERA Registration Status' in df.columns:
            df = df[df['RERA Registration Status'] == rera]
        else:
            logging.warning("RERA Registration Status column not found in the dataset")

        df = df[df['BHK'] == bhk]
        df = df[df['Gym Available'] == gym]
        df = df[df['Swimming Pool Available'] == pool]

        # If no matches are found, relax the filters
        if df.empty:
            logging.info("No properties found with exact match, relaxing filters...")

            if df.empty:
                df = df_properties[df_properties['BHK'] == bhk]
            if df.empty:
                df = df_properties[df_properties['Location'].str.lower() == location]
            if df.empty:
                df = df_properties[df_properties['Gym Available'] == gym]
            if df.empty:
                df = df_properties[df_properties['Swimming Pool Available'] == pool]
            if df.empty and 'RERA Registration Status' in df_properties.columns:
                df = df_properties[df_properties['RERA Registration Status'] == rera]

        if df.empty:
            df = df_properties.copy()

        def estimate_rent(row, max_price):
            rent = {
                1: np.random.randint(7000, 15000),
                2: np.random.randint(13000, 25000),
                3: np.random.randint(20000, 35000)
            }.get(int(row['BHK'].split()[0]), 10000)
            if row['Gym Available']:
                rent *= 1.05
            if row['Swimming Pool Available']:
                rent *= 1.07
            price_factor = row['Average Price'] / max_price
            rent = rent * (1 + price_factor * 0.1)
            return int(rent)

        def demand_score(row, max_price, max_rent):
            price_factor = (max_price - row['Average Price']) / max_price
            rent_factor = (max_rent - row['Estimated Rent']) / max_rent
            score = price_factor * 3 + rent_factor * 2
            score += 1 if row['Gym Available'] else 0
            score += 1 if row['Swimming Pool Available'] else 0
            return score

        max_price = df['Average Price'].max()
        df['Estimated Rent'] = df.apply(lambda r: estimate_rent(r, max_price), axis=1)
        max_rent = df['Estimated Rent'].max()
        df['Demand Score'] = df.apply(lambda r: demand_score(r, max_price, max_rent), axis=1)

        min_score, max_score = df['Demand Score'].min(), df['Demand Score'].max()
        if max_score != min_score:
            df['Star Rating'] = 5 * (df['Demand Score'] - min_score) / (max_score - min_score)
        else:
            df['Star Rating'] = 3

        df_sorted = df.sort_values(by='Demand Score', ascending=False).head(10)

        result = df_sorted[[ 
            'Society Name', 'Location', 'Average Price', 'BHK',
            'Gym Available', 'Swimming Pool Available', 'Estimated Rent', 'Star Rating'
        ]].rename(columns={"Average Price": "Price"})

        return {"properties": result.to_dict(orient="records")}

    except Exception as e:
        logging.exception("Prediction error")
        return {"error": str(e)}
