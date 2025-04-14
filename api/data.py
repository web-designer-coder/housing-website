import pandas as pd
import numpy as np
import joblib
import os

# Load the label encoder (since it's saved as a pickle file)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
encoder_path = os.path.join(BASE_DIR, 'housing_data', 'label_encoder.pkl')
label_encoder = joblib.load(encoder_path)

# Correct path to the CSV file (based on your system)
properties_path = r'C:\Users\aryan\Downloads\CEP_3\api\housing_data\Final_Demand_Prediction_With_Amenities.csv'  # Correct path
df_properties = pd.read_csv(properties_path)

def preprocess_input(location: str, bhk: int, rera: bool, gym: str, pool: str):
    # Encode location using the label encoder
    loc_encoded = label_encoder.transform([location])[0] if location in label_encoder.classes_ else -1
    
    # Convert RERA flag to binary (1/0)
    rera_val = 1 if rera else 0
    
    # Convert Gym and Pool to binary (1/0)
    gym_val = 1 if gym.lower() == "yes" else 0
    pool_val = 1 if pool.lower() == "yes" else 0
    
    # Filter properties based on input parameters
    filtered_properties = df_properties[
        (df_properties['BHK'] == bhk) &
        (df_properties['Gym Available'] == gym_val) &
        (df_properties['Swimming Pool Available'] == pool_val)
    ]
    
    # If location is valid, filter properties by location
    if loc_encoded != -1:
        filtered_properties = filtered_properties[filtered_properties['Location'] == loc_encoded]

    # Return filtered properties with relevant details (like name, location, price, etc.)
    return filtered_properties[['Society Name', 'Location', 'Price', 'Gym Available', 'Swimming Pool Available', 'Star Rating', 'Estimated Rent']]
