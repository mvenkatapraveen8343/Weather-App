const API_KEY = "856180378abf4a3183674246250207";

// Weather condition to background class mapping
const weatherBackgrounds = {
    'sunny': 'sunny',
    'clear': 'sunny',
    'partly cloudy': 'cloudy',
    'cloudy': 'cloudy',
    'overcast': 'cloudy',
    'mist': 'cloudy',
    'fog': 'cloudy',
    'rain': 'rainy',
    'drizzle': 'rainy',
    'snow': 'snowy',
    'sleet': 'snowy',
    'thunder': 'thunder',
    'thundery outbreaks': 'thunder'
};

// Set background based on weather condition
function setWeatherBackground(condition) {
    const body = document.body;

    // Remove all weather classes
    body.classList.remove('sunny', 'cloudy', 'rainy', 'snowy', 'thunder', 'night');

    // Check if night time
    const hour = new Date().getHours();
    const isNight = hour < 6 || hour > 20;

    // Find matching background class
    const lowerCondition = condition.toLowerCase();
    let backgroundClass = 'cloudy'; // default

    for (const [key, value] of Object.entries(weatherBackgrounds)) {
        if (lowerCondition.includes(key)) {
            backgroundClass = value;
            break;
        }
    }

    // Apply night class if appropriate
    if (isNight && backgroundClass !== 'thunder' && backgroundClass !== 'rainy') {
        backgroundClass = 'night';
    }

    body.classList.add(backgroundClass);
}

async function getData() {
    const cityInput = document.getElementById("enteredCity");
    const city = cityInput.value.trim();

    if (!city) {
        alert("Please enter a city name");
        return;
    }

    try {
        const API_URL = `https://api.weatherapi.com/v1/forecast.json?q=${city}&key=${API_KEY}&days=7`;
        const response = await axios.get(API_URL);

        // Show all sections
        document.getElementById("current").style.display = "block";
        document.getElementById("forecast").style.display = "block";
        document.getElementById("airConditions").style.display = "block";
        document.getElementById("weeklyForecast").style.display = "block";

        // Set background based on current weather
        setWeatherBackground(response.data.current.condition.text);

        currentDetails(response.data);
        showForecast(response.data);
        showAirConditions(response.data);
        showWeeklyForecast(response.data);

    } catch (error) {
        console.error("Error fetching weather data:", error);
        alert("Failed to get weather data. Please check the city name and try again.");
    }
}

function currentDetails(data) {
    document.getElementById("cityName").textContent = `${data.location.name}, ${data.location.country}`;
    document.getElementById("weatherText").textContent = data.current.condition.text;
    document.getElementById("temperature").textContent = Math.round(data.current.temp_c);

    const weatherIcon = document.getElementById("weatherIcon");
    weatherIcon.src = `https:${data.current.condition.icon}`;
    weatherIcon.alt = data.current.condition.text;

    // Add animation to weather icon
    weatherIcon.style.animation = "bounce 0.5s ease";
    setTimeout(() => {
        weatherIcon.style.animation = "";
    }, 500);
}

function showForecast(data) {
    const hours = data.forecast.forecastday[0].hour;
    const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };

    for (let i = 0, j = 1; j <= 8; i += 3, j++) {
        const hour = hours[i];
        const forecastElement = document.getElementById(`forecast${j}`);

        forecastElement.innerHTML = `
                    <p class="hour-time">${new Date(hour.time).toLocaleTimeString([], timeOptions)}</p>
                    <img src="https:${hour.condition.icon}" alt="${hour.condition.text}" />
                    <p class="hour-temp">${Math.round(hour.temp_c)}°</p>
                `;
    }
}

function showAirConditions(data) {
    const current = data.current;
    const uvIndex = getUvIndexDescription(current.uv);

    document.getElementById("realFeel").textContent = `${Math.round(current.feelslike_c)}°`;
    document.getElementById("wind").textContent = `${current.wind_kph} km/h`;
    document.getElementById("humidity").textContent = `${current.humidity}%`;
    document.getElementById("uv").textContent = uvIndex;
}

function getUvIndexDescription(uv) {
    if (uv <= 2) return `${uv} (Low)`;
    if (uv <= 5) return `${uv} (Moderate)`;
    if (uv <= 7) return `${uv} (High)`;
    if (uv <= 10) return `${uv} (Very High)`;
    return `${uv} (Extreme)`;
}

function showWeeklyForecast(data) {
    const container = document.getElementById("forecastDaysContainer");
    container.innerHTML = "";

    data.forecast.forecastday.forEach(day => {
        const date = new Date(day.date);
        const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
        const icon = day.day.condition.icon;
        const text = day.day.condition.text;

        const card = document.createElement("div");
        card.className = "forecast-day";
        card.innerHTML = `
                    <div class="day-info">
                        <span class="day-name">${dayName}</span>
                        <img src="https:${icon}" alt="${text}" />
                        <span class="day-condition" style="text-align: center;">${text}</span>
                    </div>
                    <div class="day-temp">
                        <span class="temp-high">${Math.round(day.day.maxtemp_c)}°</span>
                        <span class="temp-low">${Math.round(day.day.mintemp_c)}°</span>
                    </div>
                `;

        container.appendChild(card);
    });
}

// Add keyframe animation for weather icon
const style = document.createElement('style');
style.textContent = `
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-10px); }
            }
        `;
document.head.appendChild(style);

// Event listener for Enter key
document.getElementById("enteredCity").addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        getData();
    }
});

// Initialize with a default city
window.onload = function () {
    document.getElementById("enteredCity").value = "Hyderabad";
    getData();
};
