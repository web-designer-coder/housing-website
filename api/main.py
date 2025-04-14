from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
from sklearn.preprocessing import LabelEncoder
import logging
import os

# Set up basic logging configuration
logging.basicConfig(level=logging.INFO)

# Load model and data
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, 'housing_data', 'housing_demand_model.h5')
csv_path = os.path.join(BASE_DIR, 'housing_data', 'Final_Demand_Prediction_With_Amenities.csv')

model = joblib.load(model_path)
data = pd.read_csv(csv_path)

# Fit label encoder from training data
label_encoder = LabelEncoder()
data['Location'] = label_encoder.fit_transform(data['Location'])

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
    location: str
    bhk: int
    gym: str
    pool: str
    rera: str

def encode_location(location: str) -> int:
    location = location.strip().lower()
    valid_locations = [loc.lower() for loc in label_encoder.classes_]
    if location in valid_locations:
        index = valid_locations.index(location)
        return label_encoder.transform([label_encoder.classes_[index]])[0]
    
    # Log unknown location
    logging.warning(f"Unknown location received: {location}")
    return -1  # Unknown location fallback

# POST route for predictions
@app.post("/predict")
def predict(req: PredictionRequest):
    try:
        # Encode the location using the pre-trained label encoder
        encoded_location = encode_location(req.location)
        if encoded_location == -1:
            return {"error": "Unknown location. Please choose from valid options."}

        # Convert Yes/No to binary for gym, pool, and rera
        def to_binary(value: str):
            return 1 if value.lower() == 'yes' else 0

        # Create features vector based on the selected parameters
        features = [
            req.bhk,                     # BHK
            encoded_location,            # Location (encoded)
            to_binary(req.gym),          # Gym (Yes/No -> 1/0)
            to_binary(req.pool),         # Pool (Yes/No -> 1/0)
            to_binary(req.rera)          # RERA (Yes/No -> 1/0)
        ]

        # Make prediction using the model
        prediction = model.predict([features])
        logging.info(f"Prediction successful for location: {req.location}, Score: {float(prediction[0])}")

        return {"prediction": float(prediction[0])}

    except Exception as e:
        return {"error": str(e)}
