document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('ai-form');
  const resultContainer = document.createElement('div');
  resultContainer.id = 'ai-prediction-result';
  resultContainer.style.marginTop = '1.5rem';
  form.appendChild(resultContainer);

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Clear previous results and show loading spinner
    resultContainer.innerHTML = '<div style="color: #3b82f6;">⏳ Fetching results...</div>';

    let rawBhk = document.getElementById("bhk").value;
    let formattedBhk = null;

    try {
      formattedBhk = validateBHKFormat(rawBhk);
    } catch (e) {
      resultContainer.innerHTML = `<div style="color: red;">❌ Please select a valid BHK value (1–5).</div>`;
      return;
    }

    const payload = {
      bhk: parseInt(formattedBhk), // Use the validated BHK integer
      location: document.getElementById("location").value.trim(),
      rera: document.getElementById("rera").value === "Yes",     // returns true/false
      gym: document.getElementById("gym").value,                 // "Yes" or "No"
      pool: document.getElementById("pool").value                // "Yes" or "No"
    };

    // Validate gym and pool inputs
    if (!["Yes", "No"].includes(payload.gym)) {
      resultContainer.innerHTML = `<div style="color: red;">❌ Please choose 'Yes' or 'No' for Gym.</div>`;
      return;
    }
    
    if (!["Yes", "No"].includes(payload.pool)) {
      resultContainer.innerHTML = `<div style="color: red;">❌ Please choose 'Yes' or 'No' for Pool.</div>`;
      return;
    }

    // ✅ FIXED fetch() call here:
    fetch("https://housing-backend-4lag.onrender.com/predict", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
      })
      .then(data => {
        if (data.properties && data.properties.length > 0) {
          let propertiesHtml = `
            <div style="background-color: #f0f9ff; padding: 1rem; border-radius: 0.5rem; border: 1px solid #3b82f6; color: #2563eb; text-align: center;">
              <strong>Matching Properties:</strong>
            </div>
            <ul style="list-style-type: none; padding-left: 0;">`;

          data.properties.forEach(property => {
            propertiesHtml += `
              <li>
                <strong>Society Name:</strong> ${property['Society Name']}<br>
                <strong>Location:</strong> ${property['Location']}<br>
                <strong>Price:</strong> ₹${property['Price']}<br>
                <strong>BHK:</strong> ${property['BHK']}<br>
                <strong>Gym Available:</strong> ${property['Gym Available'] ? 'Yes' : 'No'}<br>
                <strong>Swimming Pool Available:</strong> ${property['Swimming Pool Available'] ? 'Yes' : 'No'}<br>
                <strong>Estimated Rent:</strong> ₹${property['Estimated Rent']} per month<br>
                <strong>Star Rating:</strong> ${parseFloat(property['Star Rating']).toFixed(1)}⭐
              </li>`;
          });

          propertiesHtml += '</ul>';
          resultContainer.innerHTML = propertiesHtml;

        } else {
          resultContainer.innerHTML = `<div style="color: red;">❌ No matching properties found. Please try again with different parameters.</div>`;
        }
      })
      .catch(error => {
        console.error('Error:', error);
        resultContainer.innerHTML = `<div style="color: red;">❌ Prediction failed. Please try again later.</div>`;
      });
  });
});

// Function to validate BHK format (e.g., "1BHK", "2BHK", etc.)
function validateBHKFormat(bhk) {
  const match = bhk.match(/^(\d+)(BHK)$/i);
  if (match) {
    const bhkInt = parseInt(match[1], 10);
    if (bhkInt >= 1 && bhkInt <= 5) {
      return bhkInt; // Return the integer BHK value
    }
  }
  throw new Error("Invalid BHK value");
}
