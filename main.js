// DOM Elements
document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();

  // Initialize all components
  initNavbar();
  initThemeToggle();
  initAuthModal();
  initPropertySearch();
  initCityGuide();
  initMortgageCalculator();
  initPropertyComparison();
  initTestimonials();
  initNewsletter();
});

// Navbar functionality
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileMenuIcon = mobileMenuButton.querySelector('i');

  // Handle navbar background on scroll
  window.addEventListener('scroll', function() {
    if (window.scrollY > 10) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Trigger scroll event on page load to set initial state
  window.dispatchEvent(new Event('scroll'));

  // Mobile menu toggle
  mobileMenuButton.addEventListener('click', function() {
    mobileMenu.classList.toggle('active');
    
    if (mobileMenu.classList.contains('active')) {
      mobileMenuIcon.classList.remove('fa-bars');
      mobileMenuIcon.classList.add('fa-times');
    } else {
      mobileMenuIcon.classList.remove('fa-times');
      mobileMenuIcon.classList.add('fa-bars');
    }
  });

  // Close mobile menu when clicking on a link
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  mobileNavLinks.forEach(link => {
    link.addEventListener('click', function() {
      mobileMenu.classList.remove('active');
      mobileMenuIcon.classList.remove('fa-times');
      mobileMenuIcon.classList.add('fa-bars');
    });
  });

  // Smooth scrolling for all anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = 80; // Account for fixed header
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Theme toggle functionality
function initThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleIcon = themeToggle.querySelector('i');
  
  // Check for saved theme preference or use system preference
  const savedTheme = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    document.documentElement.classList.add('dark');
    themeToggleIcon.classList.remove('fa-moon');
    themeToggleIcon.classList.add('fa-sun');
  }
  
  // Toggle theme on button click
  themeToggle.addEventListener('click', function() {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      themeToggleIcon.classList.remove('fa-sun');
      themeToggleIcon.classList.add('fa-moon');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      themeToggleIcon.classList.remove('fa-moon');
      themeToggleIcon.classList.add('fa-sun');
    }
  });

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      if (e.matches) {
        document.documentElement.classList.add('dark');
        themeToggleIcon.classList.remove('fa-moon');
        themeToggleIcon.classList.add('fa-sun');
      } else {
        document.documentElement.classList.remove('dark');
        themeToggleIcon.classList.remove('fa-sun');
        themeToggleIcon.classList.add('fa-moon');
      }
    }
  });
}

// Authentication Modal
function initAuthModal() {
  const loginButton = document.getElementById('login-button');
  const signupButton = document.getElementById('signup-button');
  const mobileLoginButton = document.getElementById('mobile-login-button');
  const mobileSignupButton = document.getElementById('mobile-signup-button');
  const authModal = document.getElementById('auth-modal');
  const authClose = document.getElementById('auth-close');
  const authTitle = document.getElementById('auth-title');
  const authSubtitle = document.getElementById('auth-subtitle');
  const authForm = document.getElementById('auth-form');
  const nameField = document.getElementById('name-field');
  const forgotPassword = document.getElementById('forgot-password');
  const authSwitchText = document.getElementById('auth-switch-text');
  const authSwitchBtn = document.getElementById('auth-switch-btn');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const passwordInput = document.getElementById('password');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');

  let authType = 'login'; // 'login' or 'signup'
  let isSubmitting = false;

  // Open modal with login form
  loginButton.addEventListener('click', function() {
    openAuthModal('login');
  });

  mobileLoginButton.addEventListener('click', function() {
    openAuthModal('login');
  });

  // Open modal with signup form
  signupButton.addEventListener('click', function() {
    openAuthModal('signup');
  });

  mobileSignupButton.addEventListener('click', function() {
    openAuthModal('signup');
  });

  // Close modal
  authClose.addEventListener('click', function() {
    authModal.classList.remove('active');
    resetForm();
  });

  // Close modal when clicking outside
  authModal.addEventListener('click', function(e) {
    if (e.target === authModal) {
      authModal.classList.remove('active');
      resetForm();
    }
  });

  // Toggle password visibility
  togglePasswordBtn.addEventListener('click', function() {
    const icon = togglePasswordBtn.querySelector('i');
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      icon.classList.remove('fa-eye');
      icon.classList.add('fa-eye-slash');
    } else {
      passwordInput.type = 'password';
      icon.classList.remove('fa-eye-slash');
      icon.classList.add('fa-eye');
    }
  });

  // Switch between login and signup
  authSwitchBtn.addEventListener('click', function() {
    authType = authType === 'login' ? 'signup' : 'login';
    updateAuthForm();
    resetErrors();
  });

  // Form submission
  authForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Reset errors
    resetErrors();
    
    // Get form values
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    const name = authType === 'signup' ? nameInput.value.trim() : '';
    
    // Validate form
    let isValid = true;
    
    if (authType === 'signup' && !name) {
      nameError.textContent = 'Name is required';
      nameInput.classList.add('error');
      isValid = false;
    }
    
    if (!email) {
      emailError.textContent = 'Email is required';
      emailInput.classList.add('error');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      emailError.textContent = 'Email is invalid';
      emailInput.classList.add('error');
      isValid = false;
    }
    
    if (!password) {
      passwordError.textContent = 'Password is required';
      passwordInput.classList.add('error');
      isValid = false;
    } else if (authType === 'signup' && password.length < 8) {
      passwordError.textContent = 'Password must be at least 8 characters';
      passwordInput.classList.add('error');
      isValid = false;
    }
    
    if (isValid) {
      // Show loading state
      isSubmitting = true;
      const submitBtn = authForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
      submitBtn.disabled = true;
      
      // Simulate API call
      setTimeout(function() {
        // Reset loading state
        isSubmitting = false;
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Show success message
        authForm.innerHTML = `
          <div class="auth-success">
            <i class="fas fa-check-circle" style="font-size: 3rem; color: var(--primary); margin-bottom: 1rem;"></i>
            <h3 style="margin-bottom: 0.5rem; font-size: 1.25rem; font-weight: 600;">${authType === 'login' ? 'Login Successful!' : 'Account Created!'}</h3>
            <p style="color: #6b7280;">${authType === 'login' ? 'Welcome back to HomeScape.' : 'Welcome to HomeScape! Your account has been created successfully.'}</p>
          </div>
        `;
        
        // Close modal after delay
        setTimeout(function() {
          authModal.classList.remove('active');
          resetForm();
        }, 2000);
      }, 1500);
    }
  });

  // Helper function to open auth modal
  function openAuthModal(type) {
    authType = type;
    updateAuthForm();
    resetErrors();
    resetForm(false);
    authModal.classList.add('active');
  }

  // Helper function to update auth form based on type
  function updateAuthForm() {
    if (authType === 'login') {
      authTitle.textContent = 'Welcome Back';
      authSubtitle.textContent = 'Sign in to access your account';
      nameField.classList.add('hidden');
      forgotPassword.classList.remove('hidden');
      authSwitchText.textContent = "Don't have an account?";
      authSwitchBtn.textContent = 'Sign up';
      authForm.querySelector('button[type="submit"]').textContent = 'Sign In';
    } else {
      authTitle.textContent = 'Create Account';
      authSubtitle.textContent = 'Join HomeScape to find your dream home';
      nameField.classList.remove('hidden');
      forgotPassword.classList.add('hidden');
      authSwitchText.textContent = 'Already have an account?';
      authSwitchBtn.textContent = 'Sign in';
      authForm.querySelector('button[type="submit"]').textContent = 'Create Account';
    }
  }

  // Helper function to reset errors
  function resetErrors() {
    nameError.textContent = '';
    emailError.textContent = '';
    passwordError.textContent = '';
    nameInput.classList.remove('error');
    emailInput.classList.remove('error');
    passwordInput.classList.remove('error');
  }

  // Helper function to reset form
  function resetForm(resetType = true) {
    if (resetType) {
      authType = 'login';
      updateAuthForm();
    }
    
    // Reset form fields
    if (authForm.querySelector('.auth-success')) {
      authForm.innerHTML = `
        <div id="name-field" class="auth-form-group hidden">
          <label for="name" class="auth-form-label">Full Name</label>
          <div class="auth-input-wrapper">
            <i class="fas fa-user auth-input-icon"></i>
            <input type="text" id="name" name="name" class="auth-input" placeholder="John Doe">
          </div>
          <p id="name-error" class="auth-error"></p>
        </div>

        <div class="auth-form-group">
          <label for="email" class="auth-form-label">Email Address</label>
          <div class="auth-input-wrapper">
            <i class="fas fa-envelope auth-input-icon"></i>
            <input type="email" id="email" name="email" class="auth-input" placeholder="your@email.com">
          </div>
          <p id="email-error" class="auth-error"></p>
        </div>

        <div class="auth-form-group">
          <label for="password" class="auth-form-label">Password</label>
          <div class="auth-input-wrapper">
            <i class="fas fa-lock auth-input-icon"></i>
            <input type="password" id="password" name="password" class="auth-input" placeholder="Enter your password">
            <button type="button" id="toggle-password" class="auth-toggle-password">
              <i class="fas fa-eye"></i>
            </button>
          </div>
          <p id="password-error" class="auth-error"></p>

          <div id="forgot-password" class="auth-forgot-password">
            <a href="#" class="auth-link">Forgot password?</a>
          </div>
        </div>

        <button type="submit" class="btn btn-primary auth-submit">Sign In</button>
      `;
      
      // Reinitialize elements
      nameInput = document.getElementById('name');
      emailInput = document.getElementById('email');
      passwordInput = document.getElementById('password');
      nameError = document.getElementById('name-error');
      emailError = document.getElementById('email-error');
      passwordError = document.getElementById('password-error');
      forgotPassword = document.getElementById('forgot-password');
      nameField = document.getElementById('name-field');
      togglePasswordBtn = document.getElementById('toggle-password');
      
      // Reattach toggle password event
      togglePasswordBtn.addEventListener('click', function() {
        const icon = togglePasswordBtn.querySelector('i');
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          passwordInput.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      });
    } else {
      nameInput.value = '';
      emailInput.value = '';
      passwordInput.value = '';
    }
    
    resetErrors();
  }
}

// Property Search functionality
// DOM Elements
function initPropertySearch() {
  const searchForm = document.getElementById('ai-form'); // updated
  const searchResults = document.getElementById('search-results'); // add this div in HTML if not present
  const searchLoading = document.getElementById('search-loading'); // add this div in HTML if not present


  // Mock properties data
  const mockProperties = [
    {
      id: 1,
      title: "Luxury Apartment in South Mumbai",
      location: "Mumbai, Maharashtra",
      price: 9500000,
      bhk: 3,
      sqft: 1800,
      reraApproved: true,
      image: "https://via.placeholder.com/400x250?text=Mumbai+Apartment",
    },
    {
      id: 2,
      title: "Modern Villa in Whitefield",
      location: "Bangalore, Karnataka",
      price: 12000000,
      bhk: 4,
      sqft: 2500,
      reraApproved: true,
      image: "https://via.placeholder.com/400x250?text=Bangalore+Villa",
    },
    {
      id: 3,
      title: "Spacious Flat in Gurgaon",
      location: "Gurgaon, Haryana",
      price: 7500000,
      bhk: 3,
      sqft: 1600,
      reraApproved: true,
      image: "https://via.placeholder.com/400x250?text=Gurgaon+Flat",
    },
    {
      id: 4,
      title: "Penthouse in Banjara Hills",
      location: "Hyderabad, Telangana",
      price: 15000000,
      bhk: 4,
      sqft: 3000,
      reraApproved: false,
      image: "https://via.placeholder.com/400x250?text=Hyderabad+Penthouse",
    },
    {
      id: 5,
      title: "Garden Apartment in Koregaon Park",
      location: "Pune, Maharashtra",
      price: 6500000,
      bhk: 2,
      sqft: 1200,
      reraApproved: true,
      image: "https://via.placeholder.com/400x250?text=Pune+Apartment",
    },
    {
      id: 6,
      title: "Beachside Villa in Goa",
      location: "North Goa, Goa",
      price: 18000000,
      bhk: 5,
      sqft: 3500,
      reraApproved: false,
      image: "https://via.placeholder.com/400x250?text=Goa+Villa",
    },
  ];

  searchForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const location = document.getElementById('location').value;
    const bhk = document.getElementById('bhk').value;
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;
    const reraApproved = document.getElementById('reraApproved').checked;

    searchResults.innerHTML = '';
    searchLoading.classList.remove('hidden');

    const formData = new FormData();
    formData.append("location", location);
    formData.append("bhk", bhk);
    formData.append("price", minPrice); // or average if you prefer
    formData.append("reraApproved", reraApproved);

    // Send data to FastAPI
    fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      body: formData
    })
      .then(response => response.json())
      .then(data => {
        // Show prediction in popup modal
        document.getElementById('prediction-text').innerText =
        `Based on your inputs, the estimated demand score is ${data.prediction.toFixed(2)}`;

        document.getElementById('prediction-modal').classList.remove('hidden');

        // Close modal on click of X
        document.getElementById('close-modal').onclick = function () {
        document.getElementById('prediction-modal').classList.add('hidden');
        };


        // Filter mock properties
        const results = mockProperties.filter(property => {
          if (location && property.location !== location) return false;
          if (bhk && property.bhk !== parseInt(bhk)) return false;
          if (minPrice && property.price < parseInt(minPrice)) return false;
          if (maxPrice && property.price > parseInt(maxPrice)) return false;
          if (reraApproved && !property.reraApproved) return false;
          return true;
        });

        searchLoading.classList.add('hidden');

        // Show prediction box and results
        if (results.length > 0) {
          searchResults.innerHTML += `<h3 class="search-results-title">${results.length} Properties Found</h3>`;
          const resultsGrid = document.createElement('div');
          resultsGrid.className = 'search-results';

          results.forEach(property => {
            resultsGrid.innerHTML += `
              <div class="property-card">
                <img src="${property.image}" alt="${property.title}" class="property-image">
                <div class="property-content">
                  <div class="property-tags">
                    <span class="property-tag">${property.bhk} BHK</span>
                    <span class="property-rera">
                      ${property.reraApproved 
                        ? '<i class="fas fa-check-circle property-rera-icon" style="color: #059669;"></i> RERA Approved' 
                        : 'Non-RERA'}
                    </span>
                  </div>
                  <h3 class="property-title">${property.title}</h3>
                  <div class="property-location">
                    <i class="fas fa-map-marker-alt property-location-icon"></i>
                    <span>${property.location}</span>
                  </div>
                  <div class="property-details">
                    <span class="property-area">${property.sqft} sq.ft</span>
                    <span class="property-price">₹${formatPrice(property.price)}</span>
                  </div>
                  <button class="btn btn-primary property-btn">View Details</button>
                </div>
              </div>
            `;
          });

          searchResults.appendChild(resultsGrid);
        } 
      })
      .catch(error => {
        searchLoading.classList.add('hidden');
        console.error("Prediction failed:", error);
        searchResults.innerHTML = `
          <div style="color: red; padding: 1rem;">Failed to fetch AI prediction. Please try again later.</div>
        `;
      });
  });
}

  
  // Helper function to format price
  function formatPrice(price) {
    if (price >= 10000000) {
      return (price / 10000000).toFixed(2) + ' Cr';
    } else {
      return (price / 100000).toFixed(2) + ' L';
    }
  }


// City Guide functionality
function initCityGuide() {
  // City data
  const cities = [
    {
      id: 1,
      name: "Mumbai",
      state: "Maharashtra",
      image: "https://via.placeholder.com/500x300?text=Mumbai",
      description:
        "The financial capital of India, Mumbai offers a mix of modern high-rises and colonial-era buildings. The real estate market is premium with high demand in areas like Bandra, Worli, and Powai.",
      population: "20.4 million",
      avgPrice: "₹18,500/sq.ft",
      weather: "Tropical",
      topAreas: ["Bandra", "Worli", "Andheri", "Powai", "Juhu"],
      temperature: "24-32°C",
    },
    {
      id: 2,
      name: "Delhi",
      state: "Delhi",
      image: "https://via.placeholder.com/500x300?text=Delhi",
      description:
        "The national capital offers a blend of historical charm and modern infrastructure. South Delhi and Gurgaon are premium locations, while areas like Dwarka offer more affordable options.",
      population: "30.3 million",
      avgPrice: "₹12,800/sq.ft",
      weather: "Extreme",
      topAreas: ["South Delhi", "Dwarka", "Vasant Kunj", "New Delhi", "Rohini"],
      temperature: "18-40°C",
    },
    {
      id: 3,
      name: "Bangalore",
      state: "Karnataka",
      image: "https://via.placeholder.com/500x300?text=Bangalore",
      description:
        "India's Silicon Valley has a thriving real estate market driven by the IT industry. Areas like Whitefield and Electronic City are popular among tech professionals.",
      population: "12.8 million",
      avgPrice: "₹7,900/sq.ft",
      weather: "Moderate",
      topAreas: ["Whitefield", "Electronic City", "Indiranagar", "Koramangala", "Hebbal"],
      temperature: "20-28°C",
    },
    {
      id: 4,
      name: "Hyderabad",
      state: "Telangana",
      image: "https://via.placeholder.com/500x300?text=Hyderabad",
      description:
        "Known for its rich history and emerging tech scene, Hyderabad offers affordable housing compared to other major cities. HITEC City and Financial District are popular areas.",
      population: "10.5 million",
      avgPrice: "₹5,200/sq.ft",
      weather: "Hot & Dry",
      topAreas: ["HITEC City", "Gachibowli", "Banjara Hills", "Jubilee Hills", "Kukatpally"],
      temperature: "22-38°C",
    },
    {
      id: 5,
      name: "Chennai",
      state: "Tamil Nadu",
      image: "https://via.placeholder.com/500x300?text=Chennai",
      description:
        "A major cultural and economic hub in South India, Chennai has a stable real estate market. Areas like OMR and ECR are seeing significant development.",
      population: "11.2 million",
      avgPrice: "₹6,800/sq.ft",
      weather: "Hot & Humid",
      topAreas: ["OMR", "ECR", "Adyar", "T. Nagar", "Velachery"],
      temperature: "24-36°C",
    },
    {
      id: 6,
      name: "Pune",
      state: "Maharashtra",
      image: "https://via.placeholder.com/500x300?text=Pune",
      description:
        "Known as the 'Oxford of the East', Pune offers a pleasant climate and growing IT sector. Areas like Kharadi and Hinjewadi are popular among young professionals.",
      population: "7.4 million",
      avgPrice: "₹6,200/sq.ft",
      weather: "Pleasant",
      topAreas: ["Kharadi", "Hinjewadi", "Koregaon Park", "Baner", "Viman Nagar"],
      temperature: "18-32°C",
    },
  ];
  
  const cityTabs = document.getElementById('city-tabs');
  const cityCard = document.getElementById('city-card');
  const cityMapName = document.getElementById('city-map-name');
  const cityMapImg = document.getElementById('city-map-img');
  
  let selectedCityId = 1;
  let isAnimating = false;
  
  // Create city tabs
  cities.forEach(city => {
    const tab = document.createElement('button');
    tab.className = `city-tab ${city.id === selectedCityId ? 'active' : ''}`;
    tab.dataset.cityId = city.id;
    tab.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${city.name}`;
    
    tab.addEventListener('click', function() {
      const cityId = parseInt(this.dataset.cityId);
      if (cityId === selectedCityId || isAnimating) return;
      
      // Update active tab
      document.querySelectorAll('.city-tab').forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      // Update city content with animation
      updateCityContent(cityId);
    });
    
    cityTabs.appendChild(tab);
  });
  
  // Initial city content
  updateCityContent(selectedCityId, false);
  
  // Function to update city content
  function updateCityContent(cityId, animate = true) {
    const city = cities.find(c => c.id === cityId);
    if (!city) return;
    
    selectedCityId = cityId;
    
    if (animate) {
      isAnimating = true;
      cityCard.classList.add('animating');
      
      setTimeout(() => {
        renderCityContent(city);
        cityCard.classList.remove('animating');
        isAnimating = false;
      }, 300);
    } else {
      renderCityContent(city);
    }
    
    // Update map
    cityMapName.textContent = city.name;
    cityMapImg.src = `https://via.placeholder.com/800x300?text=Map+of+${city.name}`;
    cityMapImg.alt = `Map of ${city.name}`;
  }
  
  // Function to render city content
  function renderCityContent(city) {
    // Get weather icon based on weather type
    let weatherIcon;
    switch (city.weather.toLowerCase()) {
      case 'tropical':
      case 'hot & humid':
        weatherIcon = '<i class="fas fa-umbrella-beach" style="color: #3b82f6;"></i>';
        break;
      case 'moderate':
      case 'pleasant':
        weatherIcon = '<i class="fas fa-sun" style="color: #f59e0b;"></i>';
        break;
      case 'extreme':
      case 'hot & dry':
        weatherIcon = '<i class="fas fa-temperature-high" style="color: #ef4444;"></i>';
        break;
      default:
        weatherIcon = '<i class="fas fa-cloud" style="color: #6b7280;"></i>';
    }
    
    cityCard.innerHTML = `
      <div class="city-grid">
        <div>
          <img src="${city.image}" alt="${city.name}" class="city-image">
        </div>
        <div class="city-details">
          <div class="city-header">
            <h3 class="city-name">${city.name}</h3>
            <p class="city-state">${city.state}</p>
          </div>
          
          <p class="city-description">${city.description}</p>
          
          <div class="city-stats">
            <div class="city-stat">
              <i class="fas fa-users city-stat-icon"></i>
              <div class="city-stat-content">
                <p>Population</p>
                <p>${city.population}</p>
              </div>
            </div>
            <div class="city-stat">
              <i class="fas fa-building city-stat-icon"></i>
              <div class="city-stat-content">
                <p>Avg. Price</p>
                <p>${city.avgPrice}</p>
              </div>
            </div>
            <div class="city-stat">
              ${weatherIcon}
              <div class="city-stat-content">
                <p>Weather</p>
                <p>${city.weather}</p>
              </div>
            </div>
            <div class="city-stat">
              <i class="fas fa-temperature-high city-stat-icon"></i>
              <div class="city-stat-content">
                <p>Temperature</p>
                <p>${city.temperature}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h4 class="city-areas-title">Top Areas</h4>
            <div class="city-areas">
              ${city.topAreas.map(area => `<span class="city-area">${area}</span>`).join('')}
            </div>
          
          <button class="btn btn-primary city-btn">View Properties in ${city.name}</button>
        </div>
      </div>
    `;
  }
}

// Mortgage Calculator functionality
function initMortgageCalculator() {
  // DOM elements
  const loanAmountSlider = document.getElementById('loan-amount-slider');
  const loanAmountInput = document.getElementById('loan-amount-input');
  const downPaymentSlider = document.getElementById('down-payment-slider');
  const downPaymentInput = document.getElementById('down-payment-input');
  const interestRateSlider = document.getElementById('interest-rate-slider');
  const interestRateInput = document.getElementById('interest-rate-input');
  const loanTermSlider = document.getElementById('loan-term-slider');
  const loanTermInput = document.getElementById('loan-term-input');
  
  // Results elements
  const principalAmount = document.getElementById('principal-amount');
  const principalDetail = document.getElementById('principal-detail');
  const monthlyPayment = document.getElementById('monthly-payment');
  const totalPayment = document.getElementById('total-payment');
  const totalInterest = document.getElementById('total-interest');
  const mortgageChartPrincipal = document.getElementById('mortgage-chart-principal');
  const mortgageChartInterest = document.getElementById('mortgage-chart-interest');
  
  // Initial values
  let loanAmount = 5000000; // 50 Lakhs
  let downPayment = 1000000; // 10 Lakhs
  let interestRate = 8.5; // 8.5%
  let loanTerm = 20; // 20 years
  
  // Initialize tooltips
  const tooltips = document.querySelectorAll('.tooltip');
  tooltips.forEach(tooltip => {
    tooltip.parentElement.addEventListener('mouseenter', () => {
      tooltip.style.display = 'block';
    });
    tooltip.parentElement.addEventListener('mouseleave', () => {
      tooltip.style.display = 'none';
    });
  });
  
  // Event listeners for sliders
  loanAmountSlider.addEventListener('input', function() {
    loanAmount = parseInt(this.value);
    loanAmountInput.value = formatNumber(loanAmount);
    
    // Update down payment max value (90% of loan amount)
    const maxDownPayment = loanAmount * 0.9;
    downPaymentSlider.max = maxDownPayment;
    
    // If current down payment is greater than new max, adjust it
    if (downPayment > maxDownPayment) {
      downPayment = maxDownPayment;
      downPaymentSlider.value = downPayment;
      downPaymentInput.value = formatNumber(downPayment);
    }
    
    calculateMortgage();
  });
  
  downPaymentSlider.addEventListener('input', function() {
    downPayment = parseInt(this.value);
    downPaymentInput.value = formatNumber(downPayment);
    calculateMortgage();
  });
  
  interestRateSlider.addEventListener('input', function() {
    interestRate = parseFloat(this.value);
    interestRateInput.value = interestRate;
    calculateMortgage();
  });
  
  loanTermSlider.addEventListener('input', function() {
    loanTerm = parseInt(this.value);
    loanTermInput.value = loanTerm;
    calculateMortgage();
  });
  
  // Event listeners for direct input
  loanAmountInput.addEventListener('blur', function() {
    const value = parseNumber(this.value);
    if (!isNaN(value) && value >= 100000 && value <= 100000000) {
      loanAmount = value;
      loanAmountSlider.value = loanAmount;
      this.value = formatNumber(loanAmount);
      
      // Update down payment max value
      const maxDownPayment = loanAmount * 0.9;
      downPaymentSlider.max = maxDownPayment;
      
      // If current down payment is greater than new max, adjust it
      if (downPayment > maxDownPayment) {
        downPayment = maxDownPayment;
        downPaymentSlider.value = downPayment;
        downPaymentInput.value = formatNumber(downPayment);
      }
      
      calculateMortgage();
    } else {
      this.value = formatNumber(loanAmount);
    }
  });
  
  downPaymentInput.addEventListener('blur', function() {
    const value = parseNumber(this.value);
    const maxDownPayment = loanAmount * 0.9;
    if (!isNaN(value) && value >= 0 && value <= maxDownPayment) {
      downPayment = value;
      downPaymentSlider.value = downPayment;
      this.value = formatNumber(downPayment);
      calculateMortgage();
    } else {
      this.value = formatNumber(downPayment);
    }
  });
  
  interestRateInput.addEventListener('blur', function() {
    const value = parseFloat(this.value);
    if (!isNaN(value) && value >= 5 && value <= 20) {
      interestRate = value;
      interestRateSlider.value = interestRate;
      calculateMortgage();
    } else {
      this.value = interestRate;
    }
  });
  
  loanTermInput.addEventListener('blur', function() {
    const value = parseInt(this.value);
    if (!isNaN(value) && value >= 1 && value <= 30) {
      loanTerm = value;
      loanTermSlider.value = loanTerm;
      calculateMortgage();
    } else {
      this.value = loanTerm;
    }
  });
  
  // Calculate mortgage on initial load
  calculateMortgage();
  
  // Function to calculate mortgage
  function calculateMortgage() {
    // Calculate the principal amount (loan amount - down payment)
    const principal = loanAmount - downPayment;
    
    // Convert annual interest rate to monthly rate
    const monthlyRate = interestRate / 100 / 12;
    
    // Convert loan term from years to months
    const termInMonths = loanTerm * 12;
    
    // Calculate monthly payment
    let monthlyPaymentValue;
    if (monthlyRate === 0) {
      // If interest rate is 0, simple division
      monthlyPaymentValue = principal / termInMonths;
    } else {
      // Standard mortgage formula
      const x = Math.pow(1 + monthlyRate, termInMonths);
      monthlyPaymentValue = (principal * x * monthlyRate) / (x - 1);
    }
    
    // Calculate total payment over the loan term
    const totalPaymentValue = monthlyPaymentValue * termInMonths;
    
    // Calculate total interest paid
    const totalInterestValue = totalPaymentValue - principal;
    
    // Update UI
    principalAmount.textContent = formatCurrency(principal);
    principalDetail.textContent = `Property Value: ${formatCurrency(loanAmount)} - Down Payment: ${formatCurrency(downPayment)}`;
    monthlyPayment.textContent = formatCurrency(monthlyPaymentValue);
    totalPayment.textContent = formatCurrency(totalPaymentValue);
    totalInterest.textContent = formatCurrency(totalInterestValue);
    
    // Update chart
    if (!isNaN(totalPaymentValue) && totalPaymentValue > 0) {
      const principalPercentage = (principal / totalPaymentValue) * 100;
      const interestPercentage = (totalInterestValue / totalPaymentValue) * 100;
      
      mortgageChartPrincipal.style.width = `${principalPercentage}%`;
      mortgageChartInterest.style.width = `${interestPercentage}%`;
    }
  }
  
  // Helper function to format currency
  function formatCurrency(value) {
    if (isNaN(value)) return '₹0';
    
    if (value >= 10000000) {
      // Convert to crores for values >= 1 crore
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      // Convert to lakhs for values >= 1 lakh
      return `₹${(value / 100000).toFixed(2)} L`;
    } else {
      // Regular formatting for smaller values
      return `₹${value.toLocaleString()}`;
    }
  }
  
  // Helper function to format number with commas
  function formatNumber(value) {
    return value.toLocaleString();
  }
  
  // Helper function to parse number from formatted string
  function parseNumber(value) {
    return parseInt(value.replace(/[^0-9]/g, ''));
  }
}

// Property Comparison functionality
function initPropertyComparison() {
  // Sample properties data
  const sampleProperties = [
    {
      id: 1,
      title: "Luxury Apartment in South Mumbai",
      location: "Mumbai, Maharashtra",
      price: 9500000,
      bhk: 3,
      sqft: 1800,
      reraApproved: true,
      image: "https://via.placeholder.com/400x250?text=Mumbai%20Apartment",
      amenities: ["Swimming Pool", "Gym", "24/7 Security", "Power Backup", "Club House"],
      yearBuilt: 2020,
      furnishing: "Semi-Furnished",
      parking: 2,
    },
    {
      id: 2,
      title: "Modern Villa in Whitefield",
      location: "Bangalore, Karnataka",
      price: 12000000,
      bhk: 4,
      sqft: 2500,
      reraApproved: true,
      image: "https://via.placeholder.com/400x250?text=Bangalore%20Villa",
      amenities: ["Garden", "Swimming Pool", "Gym", "24/7 Security", "Club House", "Children's Play Area"],
      yearBuilt: 2021,
      furnishing: "Fully Furnished",
      parking: 3,
    },
    {
      id: 3,
      title: "Spacious Flat in Gurgaon",
      location: "Gurgaon, Haryana",
      price: 7500000,
      bhk: 3,
      sqft: 1600,
      reraApproved: true,
      image: "https://via.placeholder.com/400x250?text=Gurgaon%20Flat",
      amenities: ["Gym", "24/7 Security", "Power Backup"],
      yearBuilt: 2019,
      furnishing: "Unfurnished",
      parking: 1,
    },
    {
      id: 4,
      title: "Penthouse in Banjara Hills",
      location: "Hyderabad, Telangana",
      price: 15000000,
      bhk: 4,
      sqft: 3000,
      reraApproved: false,
      image: "https://via.placeholder.com/400x250?text=Hyderabad%20Penthouse",
      amenities: ["Terrace Garden", "Swimming Pool", "Gym", "24/7 Security", "Club House", "Spa"],
      yearBuilt: 2022,
      furnishing: "Fully Furnished",
      parking: 2,
    },
    {
      id: 5,
      title: "Garden Apartment in Koregaon Park",
      location: "Pune, Maharashtra",
      price: 6500000,
      bhk: 2,
      sqft: 1200,
      reraApproved: true,
      image: "https://via.placeholder.com/400x250?text=Pune%20Apartment",
      amenities: ["Garden", "24/7 Security", "Power Backup"],
      yearBuilt: 2018,
      furnishing: "Semi-Furnished",
      parking: 1,
    },
    {
      id: 6,
      title: "Beachside Villa in Goa",
      location: "North Goa, Goa",
      price: 18000000,
      bhk: 5,
      sqft: 3500,
      reraApproved: false,
      image: "https://via.placeholder.com/400x250?text=Goa%20Villa",
      amenities: ["Private Beach Access", "Swimming Pool", "Garden", "24/7 Security", "Outdoor Kitchen"],
      yearBuilt: 2021,
      furnishing: "Fully Furnished",
      parking: 4,
    },
  ];
  
  // DOM elements
  const propertySelection = document.getElementById('property-selection');
  const comparisonTableContainer = document.getElementById('comparison-table-container');
  const comparisonMobile = document.getElementById('comparison-mobile');
  const noPropertiesMessage = document.getElementById('no-properties-message');
  const addPropertiesBtn = document.getElementById('add-properties-btn');
  const propertyModal = document.getElementById('property-modal');
  const propertyModalClose = document.getElementById('property-modal-close');
  const propertyModalGrid = document.getElementById('property-modal-grid');
  
  // State
  let selectedProperties = [];
  let mobileViewIndex = 0;
  
  // Initialize
  updateComparisonUI();
  
  // Event listeners
  addPropertiesBtn.addEventListener('click', function() {
    openPropertyModal();
  });
  
  propertyModalClose.addEventListener('click', function() {
    propertyModal.classList.remove('active');
  });
  
  propertyModal.addEventListener('click', function(e) {
    if (e.target === propertyModal) {
      propertyModal.classList.remove('active');
    }
  });
  
  // Function to open property modal
  function openPropertyModal() {
    // Populate modal with properties
    propertyModalGrid.innerHTML = '';
    
    sampleProperties.forEach(property => {
      const isSelected = selectedProperties.some(p => p.id === property.id);
      const card = document.createElement('div');
      card.className = `property-modal-card ${isSelected ? 'selected' : ''}`;
      card.dataset.propertyId = property.id;
      
      card.innerHTML = `
        <img src="${property.image}" alt="${property.title}" class="property-modal-image">
        <div class="property-modal-details">
          <h4 class="property-modal-title">${property.title}</h4>
          <div class="property-modal-location">
            <i class="fas fa-map-marker-alt"></i>
            <span>${property.location}</span>
          </div>
          <div class="property-modal-footer">
            <span class="property-modal-bhk">${property.bhk} BHK</span>
            <span class="property-modal-price">₹${formatPrice(property.price)}</span>
          </div>
        </div>
      `;
      
      card.addEventListener('click', function() {
        const propertyId = parseInt(this.dataset.propertyId);
        togglePropertySelection(propertyId);
      });
      
      propertyModalGrid.appendChild(card);
    });
    
    propertyModal.classList.add('active');
  }
  
  // Function to toggle property selection
  function togglePropertySelection(propertyId) {
    const property = sampleProperties.find(p => p.id === propertyId);
    if (!property) return;
    
    const isSelected = selectedProperties.some(p => p.id === propertyId);
    
    if (isSelected) {
      // Remove property
      selectedProperties = selectedProperties.filter(p => p.id !== propertyId);
    } else {
      // Add property if limit not reached
      if (selectedProperties.length < 3) {
        selectedProperties.push(property);
      } else {
        // Show error message if trying to add more than 3 properties
        const errorMsg = document.createElement('div');
        errorMsg.className = 'property-modal-error';
        errorMsg.innerHTML = `
          <div style="background-color: #fee2e2; color: #b91c1c; padding: 0.75rem; border-radius: var(--radius); margin-bottom: 1rem; display: flex; align-items: center;">
            <i class="fas fa-exclamation-circle" style="margin-right: 0.5rem;"></i>
            You can compare up to 3 properties at a time. Please remove a property before adding a new one.
          </div>
        `;
        
        // Insert at the top of the modal
        propertyModalGrid.insertBefore(errorMsg, propertyModalGrid.firstChild);
        
        // Remove error message after 3 seconds
        setTimeout(() => {
          if (errorMsg.parentNode) {
            errorMsg.parentNode.removeChild(errorMsg);
          }
        }, 3000);
        
        return;
      }
    }
    
    // Update modal UI
    const propertyCard = document.querySelector(`.property-modal-card[data-property-id="${propertyId}"]`);
    if (propertyCard) {
      propertyCard.classList.toggle('selected', !isSelected);
    }
    
    // Update comparison UI
    updateComparisonUI();
  }
  
  // Function to remove property from comparison
  function removeProperty(propertyId) {
    selectedProperties = selectedProperties.filter(p => p.id !== propertyId);
    updateComparisonUI();
  }
  
  // Function to navigate mobile view
  function navigateMobileView(direction) {
    if (direction === 'prev') {
      mobileViewIndex = Math.max(0, mobileViewIndex - 1);
    } else {
      mobileViewIndex = Math.min(selectedProperties.length - 1, mobileViewIndex + 1);
    }
    updateMobileView();
  }
  
  // Function to update comparison UI
  function updateComparisonUI() {
    // Show/hide elements based on selection
    if (selectedProperties.length === 0) {
      propertySelection.classList.add('hidden');
      comparisonTableContainer.classList.add('hidden');
      comparisonMobile.classList.add('hidden');
      noPropertiesMessage.classList.remove('hidden');
    } else {
      propertySelection.classList.remove('hidden');
      comparisonTableContainer.classList.remove('hidden');
      comparisonMobile.classList.remove('hidden');
      noPropertiesMessage.classList.add('hidden');
      
      // Update property selection area
      updatePropertySelection();
      
      // Update comparison table
      updateComparisonTable();
      
      // Update mobile view
      mobileViewIndex = Math.min(mobileViewIndex, selectedProperties.length - 1);
      updateMobileView();
    }
  }
  
  // Function to update property selection area
  function updatePropertySelection() {
    propertySelection.innerHTML = '';
    
    // Add selected properties
    selectedProperties.forEach(property => {
      const card = document.createElement('div');
      card.className = 'property-selection-card';
      
      card.innerHTML = `
        <button class="property-remove-btn" data-property-id="${property.id}">
          <i class="fas fa-times"></i>
        </button>
        <img src="${property.image}" alt="${property.title}" class="property-image">
        <div class="property-content">
          <h3 class="property-title">${property.title}</h3>
          <div class="property-location">
            <i class="fas fa-map-marker-alt property-location-icon"></i>
            <span>${property.location}</span>
          </div>
          <div class="property-details">
            <span class="property-area">${property.bhk} BHK</span>
            <span class="property-price">₹${formatPrice(property.price)}</span>
          </div>
        </div>
      `;
      
      propertySelection.appendChild(card);
    });
    
    // Add "Add Property" button if limit not reached
    if (selectedProperties.length < 3) {
      const addButton = document.createElement('div');
      addButton.className = 'add-property-btn';
      addButton.innerHTML = `
        <i class="fas fa-plus add-property-icon"></i>
        <p class="add-property-text">Add Property to Compare</p>
        <p class="add-property-subtext">
          ${selectedProperties.length === 0 
            ? 'Select up to 3 properties' 
            : `${3 - selectedProperties.length} more ${3 - selectedProperties.length === 1 ? 'slot' : 'slots'} available`}
        </p>
      `;
      
      addButton.addEventListener('click', function() {
        openPropertyModal();
      });
      
      propertySelection.appendChild(addButton);
    }
    
    // Add event listeners to remove buttons
    const removeButtons = document.querySelectorAll('.property-remove-btn');
    removeButtons.forEach(button => {
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        const propertyId = parseInt(this.dataset.propertyId);
        removeProperty(propertyId);
      });
    });
  }
  
  // Function to update comparison table
  function updateComparisonTable() {
    comparisonTableContainer.innerHTML = `
      <table class="comparison-table">
        <thead>
          <tr>
            <th>Features</th>
            ${selectedProperties.map(property => `<th>${property.title}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="comparison-feature">Price</td>
            ${selectedProperties.map(property => `<td class="comparison-price">₹${formatPrice(property.price)}</td>`).join('')}
          </tr>
          <tr>
            <td class="comparison-feature">Location</td>
            ${selectedProperties.map(property => `<td>${property.location}</td>`).join('')}
          </tr>
          <tr>
            <td class="comparison-feature">BHK</td>
            ${selectedProperties.map(property => `<td>${property.bhk} BHK</td>`).join('')}
          </tr>
          <tr>
            <td class="comparison-feature">Area</td>
            ${selectedProperties.map(property => `<td>${property.sqft} sq.ft</td>`).join('')}
          </tr>
          <tr>
            <td class="comparison-feature">RERA Approved</td>
            ${selectedProperties.map(property => `
              <td>
                ${property.reraApproved 
                  ? '<span class="comparison-check"><i class="fas fa-check"></i> Yes</span>' 
                  : '<span class="comparison-x"><i class="fas fa-times"></i> No</span>'}
              </td>
            `).join('')}
          </tr>
          <tr>
            <td class="comparison-feature">Year Built</td>
            ${selectedProperties.map(property => `<td>${property.yearBuilt}</td>`).join('')}
          </tr>
          <tr>
            <td class="comparison-feature">Furnishing</td>
            ${selectedProperties.map(property => `<td>${property.furnishing}</td>`).join('')}
          </tr>
          <tr>
            <td class="comparison-feature">Parking</td>
            ${selectedProperties.map(property => `
              <td>${property.parking} ${property.parking === 1 ? 'Space' : 'Spaces'}</td>
            `).join('')}
          </tr>
          <tr>
            <td class="comparison-feature">Amenities</td>
            ${selectedProperties.map(property => `
              <td>
                <div>
                  ${property.amenities.map(amenity => `<span class="comparison-amenity">${amenity}</span>`).join('')}
                </div>
              </td>
            `).join('')}
          </tr>
          <tr>
            <td></td>
            ${selectedProperties.map(property => `
              <td><button class="btn btn-primary">View Details</button></td>
            `).join('')}
          </tr>
        </tbody>
      </table>
    `;
  }
  
  // Function to update mobile view
  function updateMobileView() {
    if (selectedProperties.length === 0) return;
    
    const property = selectedProperties[mobileViewIndex];
    
    comparisonMobile.innerHTML = `
      <div class="comparison-mobile-card">
        ${selectedProperties.length > 1 ? `
          <div class="comparison-mobile-nav">
            <button class="comparison-mobile-nav-btn" id="mobile-prev" ${mobileViewIndex === 0 ? 'disabled' : ''}>
              <i class="fas fa-chevron-left"></i>
            </button>
            <button class="comparison-mobile-nav-btn" id="mobile-next" ${mobileViewIndex === selectedProperties.length - 1 ? 'disabled' : ''}>
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        ` : ''}
        
        <div class="comparison-mobile-header">
          <h3 class="comparison-mobile-title">${property.title}</h3>
          <p class="comparison-mobile-pagination">${mobileViewIndex + 1} of ${selectedProperties.length}</p>
        </div>
        
        <div class="comparison-mobile-details">
          <div class="comparison-mobile-item">
            <span class="comparison-mobile-label">Price</span>
            <span class="comparison-price">₹${formatPrice(property.price)}</span>
          </div>
          
          <div class="comparison-mobile-item">
            <span class="comparison-mobile-label">Location</span>
            <span>${property.location}</span>
          </div>
          
          <div class="comparison-mobile-item">
            <span class="comparison-mobile-label">BHK</span>
            <span>${property.bhk} BHK</span>
          </div>
          
          <div class="comparison-mobile-item">
            <span class="comparison-mobile-label">Area</span>
            <span>${property.sqft} sq.ft</span>
          </div>
          
          <div class="comparison-mobile-item">
            <span class="comparison-mobile-label">RERA Approved</span>
            <span>
              ${property.reraApproved 
                ? '<span class="comparison-check"><i class="fas fa-check"></i> Yes</span>' 
                : '<span class="comparison-x"><i class="fas fa-times"></i> No</span>'}
            </span>
          </div>
          
          <div class="comparison-mobile-amenities">
            <span class="comparison-mobile-amenities-label">Amenities</span>
            <div class="comparison-mobile-amenities-list">
              ${property.amenities.map(amenity => `<span class="comparison-amenity">${amenity}</span>`).join('')}
            </div>
          </div>
          
          <button class="btn btn-primary">View Details</button>
        </div>
      </div>
    `;
    
    // Add event listeners for navigation
    const prevButton = document.getElementById('mobile-prev');
    const nextButton = document.getElementById('mobile-next');
    
    if (prevButton) {
      prevButton.addEventListener('click', function() {
        navigateMobileView('prev');
      });
    }
    
    if (nextButton) {
      nextButton.addEventListener('click', function() {
        navigateMobileView('next');
      });
    }
  }
  
  // Helper function to format price
  function formatPrice(price) {
    if (price >= 10000000) {
      return (price / 10000000).toFixed(2) + ' Cr';
    } else {
      return (price / 100000).toFixed(2) + ' L';
    }
  }
}

// Testimonials functionality
function initTestimonials() {
  // Testimonial data
  const testimonials = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Homeowner",
      image: "https://via.placeholder.com/100x100?text=PS",
      content:
        "HomeScape made finding my dream home so easy! The AI predictions were spot on and saved me so much time. I found the perfect 3BHK apartment in Bangalore within a week.",
      rating: 5,
    },
    {
      id: 2,
      name: "Rahul Mehta",
      role: "Property Investor",
      image: "https://via.placeholder.com/100x100?text=RM",
      content:
        "As someone who invests in multiple properties, I need a reliable platform. HomeScape's RERA verification feature and detailed property analytics have been invaluable for my investment decisions.",
      rating: 4,
    },
    {
      id: 3,
      name: "Ananya Patel",
      role: "First-time Buyer",
      image: "https://via.placeholder.com/100x100?text=AP",
      content:
        "Being a first-time home buyer, I was nervous about the process. HomeScape's user-friendly interface and helpful customer support made everything smooth. Highly recommended!",
      rating: 5,
    },
    {
      id: 4,
      name: "Vikram Singh",
      role: "Real Estate Agent",
      image: "https://via.placeholder.com/100x100?text=VS",
      content:
        "I've been in real estate for 15 years, and HomeScape is by far the best platform I've used. The AI predictions help me better serve my clients and close deals faster.",
      rating: 5,
    },
    {
      id: 5,
      name: "Meera Kapoor",
      role: "Homeowner",
      image: "https://via.placeholder.com/100x100?text=MK",
      content:
        "After months of searching on other platforms, I found my perfect home on HomeScape in just two weeks. The filters are comprehensive and the property details are accurate.",
      rating: 4,
    },
  ];
  
  const testimonialSlider = document.getElementById('testimonials-slider');
  const testimonialDots = document.getElementById('testimonial-dots');
  const prevButton = document.getElementById('testimonial-prev');
  const nextButton = document.getElementById('testimonial-next');
  
  let currentIndex = 0;
  let isAnimating = false;
  let autoPlayInterval;
  let touchStartX = 0;
  
  // Initialize testimonials
  initTestimonialsSlider();
  
  // Function to initialize testimonials slider
  function initTestimonialsSlider() {
    // Create testimonial track
    const track = document.createElement('div');
    track.className = 'testimonials-track';
    testimonialSlider.appendChild(track);
    
    // Create testimonial cards
    testimonials.forEach((testimonial, index) => {
      const card = createTestimonialCard(testimonial, index);
      track.appendChild(card);
    });
    
    // Create dots
    testimonials.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.className = `testimonial-dot ${index === currentIndex ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to testimonial ${index + 1}`);
      
      dot.addEventListener('click', () => {
        if (isAnimating) return;
        goToSlide(index);
      });
      
      testimonialDots.appendChild(dot);
    });
    
    // Add event listeners
    prevButton.addEventListener('click', () => {
      if (isAnimating) return;
      prevSlide();
    });
    
    nextButton.addEventListener('click', () => {  return;
      prevSlide();
    });
    
    nextButton.addEventListener('click', () => {
      if (isAnimating) return;
      nextSlide();
    });
    
    // Touch events for mobile swipe
    testimonialSlider.addEventListener('touchstart', handleTouchStart, { passive: true });
    testimonialSlider.addEventListener('touchend', handleTouchEnd, { passive: true });
    
    // Start autoplay
    startAutoPlay();
    
    // Update slider position
    updateSliderPosition();
  }
  
  // Function to create testimonial card
  function createTestimonialCard(testimonial, index) {
    const card = document.createElement('div');
    card.className = `testimonial-card ${index === currentIndex ? 'active' : ''}`;
    
    // Render stars based on rating
    const stars = Array(5).fill(0).map((_, i) => 
      `<i class="fas fa-star testimonial-star ${i < testimonial.rating ? '' : 'empty'}"></i>`
    ).join('');
    
    card.innerHTML = `
      <div class="testimonial-header">
        <img src="${testimonial.image}" alt="${testimonial.name}" class="testimonial-image">
        <div class="testimonial-info">
          <h4>${testimonial.name}</h4>
          <p>${testimonial.role}</p>
          <div class="testimonial-stars">${stars}</div>
        </div>
      </div>
      <p class="testimonial-content">"${testimonial.content}"</p>
    `;
    
    return card;
  }
  
  // Function to go to next slide
  function nextSlide() {
    goToSlide((currentIndex + 1) % testimonials.length);
  }
  
  // Function to go to previous slide
  function prevSlide() {
    goToSlide((currentIndex - 1 + testimonials.length) % testimonials.length);
  }
  
  // Function to go to specific slide
  function goToSlide(index) {
    if (currentIndex === index) return;
    
    isAnimating = true;
    currentIndex = index;
    
    // Update active dot
    const dots = testimonialDots.querySelectorAll('.testimonial-dot');
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
    
    // Update active card
    const cards = testimonialSlider.querySelectorAll('.testimonial-card');
    cards.forEach((card, i) => {
      card.classList.toggle('active', i === currentIndex);
    });
    
    // Update slider position
    updateSliderPosition();
    
    // Reset animation flag after transition
    setTimeout(() => {
      isAnimating = false;
    }, 500);
    
    // Reset autoplay
    resetAutoPlay();
  }
  
  // Function to update slider position
  function updateSliderPosition() {
    const track = testimonialSlider.querySelector('.testimonials-track');
    
    // For mobile (single card view)
    if (window.innerWidth < 768) {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    } 
    // For desktop (3 cards view)
    else {
      // No need to translate, we'll use CSS to highlight the active card
    }
  }
  
  // Handle touch events for mobile swipe
  function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
  }
  
  function handleTouchEnd(e) {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    
    // If swipe distance is significant, change slide
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }
  
  // Auto-play functionality
  function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
      nextSlide();
    }, 5000);
  }
  
  function resetAutoPlay() {
    clearInterval(autoPlayInterval);
    startAutoPlay();
  }
  
  // Handle window resize
  window.addEventListener('resize', () => {
    updateSliderPosition();
  });
}

// Newsletter functionality
function initNewsletter() {
  const newsletterForm = document.getElementById('newsletter-form');
  const newsletterEmail = document.getElementById('newsletter-email');
  const newsletterError = document.getElementById('newsletter-error');
  const newsletterFormContainer = document.getElementById('newsletter-form-container');
  const newsletterSuccess = document.getElementById('newsletter-success');
  
  newsletterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get email value
    const email = newsletterEmail.value.trim();
    
    // Validate email
    if (!email) {
      newsletterError.textContent = 'Email is required';
      return;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newsletterError.textContent = 'Please enter a valid email address';
      return;
    }
    
    // Clear any previous errors
    newsletterError.textContent = '';
    
    // Simulate API call
    setTimeout(function() {
      // Show success message
      newsletterFormContainer.classList.add('hidden');
      newsletterSuccess.classList.remove('hidden');
    }, 1000);
  });
}

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

    // Collect user input values
    const payload = {
      bhk: parseInt(document.getElementById('bhk').value),
      location: document.getElementById('location').value.trim(),
      rera: document.getElementById('rera').value.trim().toLowerCase() === 'yes',
      gym: document.getElementById('gym').value.trim().toLowerCase(),
      pool: document.getElementById('pool').value.trim().toLowerCase()
    };
    

    // Validate user input
    if (isNaN(payload.bhk) || payload.bhk < 1 || payload.bhk > 3) {
      resultContainer.innerHTML = `<div style="color: red;">❌ Please select a valid BHK value (1, 2, or 3).</div>`;
      return;
    }

    if (!['yes', 'no'].includes(payload.gym)) {
      resultContainer.innerHTML = `<div style="color: red;">❌ Please choose 'yes' or 'no' for Gym.</div>`;
      return;
    }

    if (!['yes', 'no'].includes(payload.pool)) {
      resultContainer.innerHTML = `<div style="color: red;">❌ Please choose 'yes' or 'no' for Pool.</div>`;
      return;
    }

    // Send POST request to the backend
    fetch('https://housing-backend-4lag.onrender.com/predict', {
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
          // Show properties list
          let propertiesHtml = `
            <div style="background-color: #f0f9ff; padding: 1rem; border-radius: 0.5rem; border: 1px solid #3b82f6; color: #2563eb; text-align: center;">
              <strong>Matching Properties:</strong>
            </div>
            <ul style="list-style-type: none; padding-left: 0;">`;

          data.properties.forEach(property => {
            propertiesHtml += `
              <li style="border-bottom: 1px solid #ccc; padding: 1rem;">
                <strong>Society Name:</strong> ${property['Society Name']}<br>
                <strong>Location:</strong> ${property['Location']}<br>
                <strong>Price:</strong> ₹${property['Price']}<br>
                <strong>Gym Available:</strong> ${property['Gym Available'] ? 'Yes' : 'No'}<br>
                <strong>Swimming Pool Available:</strong> ${property['Swimming Pool Available'] ? 'Yes' : 'No'}<br>
                <strong>Star Rating:</strong> ${parseFloat(property['Star Rating']).toFixed(1)}⭐<br>
                <strong>Estimated Rent:</strong> ₹${property['Estimated Rent']} per month
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




