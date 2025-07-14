
# 🏡 Property Prices Prediction

This project is a web-based frontend integrated with a Python backend API that predicts property prices based on user input and housing data. The application offers a clean, user-friendly interface to input housing features and receive predictions instantly.

---
## 📊 Dataset Used

- **Filename**: `Final_Demand_Prediction_With_Amenities.csv`
- **Location**: `api/housing_data/`
- **Description**: This dataset contains property-related data used to train the ML model for price/demand prediction. It includes features like location, area, number of bedrooms, furnishing status, and possibly other amenities influencing the housing market.

---

## 🚀 Features

- 🎯 Predict property demand or price using machine learning
- 🖥️ Clean frontend using **HTML**, **CSS**, and **JavaScript**
- 🔗 API integration using **Python Flask**
- 📊 Uses a trained model (`.pkl`) for prediction
- 🧠 Encodes input using label encoders for categorical data

---

## 📂 Project Structure

```
housing-website-main/
│
├── index.html               # Main web interface
├── style.css                # Styling for the frontend
├── main.js                  # Handles form submission & API requests
│
├── api/                     # Backend API folder
│   ├── main.py              # Flask app that serves predictions
│   ├── data.py              # Helper functions to process input
│   ├── model_loader.py      # Loads model and encoders
│   └── housing_data/
│       ├── housing_demand_model.pkl     # Trained ML model
│       ├── label_encoder.pkl            # Label encoder for inputs
│       └── Final_Demand_Prediction_With_Amenities.csv
│
├── README.md                # Project documentation
└── .gitignore               # Files to ignore in version control
```

---

## 🛠️ How to Run

### Frontend
No dependencies are required. Simply open `index.html` in your browser.

### Backend

1. **Set up a virtual environment** (optional but recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

2. **Install dependencies**:
   ```bash
   pip install flask pandas scikit-learn
   ```

3. **Run the Flask server**:
   ```bash
   cd api
   python main.py
   ```

4. **Access the app**:
   - Open `index.html` in your browser.
   - The frontend will send requests to the local Flask server.

---

## 📡 API Endpoint

- **URL**: `http://localhost:5000/predict`
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Payload Example**:
```json
{
  "location": "Mumbai",
  "bedrooms": 2,
  "area": 1200,
  "furnishing": "Furnished"
}
```

---

## 📦 Requirements

- Python 3.8+
- Flask
- Pandas
- scikit-learn

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you’d like to change.

---

## 📃 License

This project is open source and available under the MIT License.
