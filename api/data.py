import joblib
import pandas as pd
import numpy as np
import logging

# Load model and encoder with error handling
def load_model_and_encoder(model_path, encoder_path):
    try:
        model = joblib.load(model_path)
        encoder = joblib.load(encoder_path)
        return model, encoder
    except Exception as e:
        logging.error(f"Error loading model or encoder: {str(e)}")
        raise

# Preprocess user input and handle location encoding
def preprocess_input(location: str, bhk: int, gym: str, pool: str, label_encoder):
    try:
        # Check if BHK is valid
        if bhk not in [1, 2, 3]:
            raise ValueError("BHK must be 1, 2, or 3")
        
        # Validate location
        matched_location = next((loc for loc in label_encoder.classes_ if loc.lower() == location.lower()), None)
        if not matched_location:
            raise ValueError(f"Location '{location}' not found in available data")
        
        # Encode location
        encoded_location = label_encoder.transform([matched_location])[0]
        
        # Ensure valid gym and pool inputs
        gym_val = 1 if gym.lower() == 'yes' else 0
        pool_val = 1 if pool.lower() == 'yes' else 0

        return encoded_location, bhk, gym_val, pool_val

    except Exception as e:
        logging.error(f"Preprocessing error: {str(e)}")
        raise
