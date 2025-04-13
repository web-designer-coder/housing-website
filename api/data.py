import numpy as np

# Dummy encoding for simplicity (adjust according to your model's training)
locations = {
    "Mumbai, Maharashtra": 0,
    "Delhi, Delhi": 1,
    "Bangalore, Karnataka": 2,
    "Hyderabad, Telangana": 3,
    "Chennai, Tamil Nadu": 4,
    "Kolkata, West Bengal": 5,
    "Pune, Maharashtra": 6,
    "Ahmedabad, Gujarat": 7,
    "Jaipur, Rajasthan": 8,
    "Lucknow, Uttar Pradesh": 9,
    "Goa": 10,
    "Gurgaon, Haryana": 11,
    "Noida, Uttar Pradesh": 12
}

def preprocess_input(location: str, bhk: int, price: float, rera: bool):
    loc_encoded = locations.get(location, -1)
    rera_val = 1 if rera else 0
    return np.array([[loc_encoded, bhk, price, rera_val]])
