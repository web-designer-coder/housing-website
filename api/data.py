import requests

def get_recommendations(location: str, bhk: int, rera: bool, gym: str, pool: str):
    url = "https://housing-backend-4lag.onrender.com/predict"  # Replace with your actual backend URL
    payload = {
        "bhk": bhk,
        "location": location,
        "rera": rera,
        "gym": gym,
        "pool": pool
    }

    try:
        response = requests.post(url, json=payload)
        response.raise_for_status()
        data = response.json()

        if "error" in data:
            print("❌ Error:", data["error"])
            return []

        properties = data.get("properties", [])
        if not properties:
            print("❌ No matching properties found. Try different filters.")
        else:
            for i, prop in enumerate(properties, 1):
                print(f"\n🏠 Option {i}:")
                print(f"📍 Society: {prop['Society Name']}")
                print(f"🛏️  BHK: {prop['BHK']}")
                print(f"🏙️  Location: {prop['Location']}")
                print(f"💰 Price: ₹ {prop['Price']}")
                print(f"🏋️‍♀️ Gym: {'Yes' if prop['Gym Available'] == 1 else 'No'}")
                print(f"🏊 Pool: {'Yes' if prop['Swimming Pool Available'] == 1 else 'No'}")
                print(f"🌟 Star Rating: {round(prop['Star Rating'], 1)} / 5")
                print(f"🏠 Estimated Rent: ₹ {prop['Estimated Rent']} per month")

        return properties

    except requests.RequestException as e:
        print("❌ Request failed:", str(e))
        return []
