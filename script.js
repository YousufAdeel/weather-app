const weatherForm = document.querySelector(".weatherForm");
const cityInput   = document.querySelector(".cityInput");
const card        = document.querySelector(".card");
const unitToggle  = document.getElementById("unitToggle");
const apiKey      = "ZCT473ANRULL9ZEQLBMG5S5BL"; // ← replace here

// Keep last‐fetched data so we can re‐render on toggle
let lastData = null;

weatherForm.addEventListener("submit", async event => {
  event.preventDefault();
  const city = cityInput.value.trim();
  if (!city) {
    displayError("Please enter a city");
    return;
  }
  try {
    const data = await getWeatherData(city);
    lastData = data;
    displayWeatherInfo(data);
  } catch (err) {
    console.error(err);
    displayError(err.message || "Could not fetch weather data");
  }
});

// Re-render in other unit when user flips the checkbox
unitToggle.addEventListener("change", () => {
  if (lastData) displayWeatherInfo(lastData);
});

async function getWeatherData(city) {
  const apiUrl =
    "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/" +
    encodeURIComponent(city) +
    `?unitGroup=metric&key=${apiKey}&contentType=json`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    if (response.status === 404) throw new Error("Location not found");
    throw new Error("Could not fetch weather data");
  }
  const json = await response.json();
  const cc   = json.currentConditions;

  return {
    location:    json.resolvedAddress,
    tempC:       cc.temp,
    humidity:    cc.humidity,
    description: cc.conditions,
    iconCode:    cc.icon
  };
}

function displayWeatherInfo(data) {
  const { location, tempC, humidity, description, iconCode } = data;

  // Convert °C → °F
  const tempF   = tempC * 9/5 + 32;
  // Pick unit based on checkbox
  const tempStr = unitToggle.checked
    ? `${tempC.toFixed(1)}°C`
    : `${tempF.toFixed(1)}°F`;

  // Clear old card
  card.innerHTML = "";
  card.style.display = "flex";

  // Create elements
  const cityDisplay     = document.createElement("h1");
  const tempDisplay     = document.createElement("p");
  const humidityDisplay = document.createElement("p");
  const descDisplay     = document.createElement("p");
  const emojiDisplay    = document.createElement("p");

  // Fill content
  cityDisplay.textContent     = location;
  tempDisplay.textContent     = tempStr;
  humidityDisplay.textContent = `Humidity: ${humidity}%`;
  descDisplay.textContent     = description;
  emojiDisplay.textContent    = mapIconToEmoji(iconCode);

  // Apply your existing classes
  cityDisplay.classList.add("cityDisplay");
  tempDisplay.classList.add("tempDisplay");
  humidityDisplay.classList.add("humidityDisplay");
  descDisplay.classList.add("descDisplay");
  emojiDisplay.classList.add("weatherEmoji");

  // Append to card
  card.appendChild(cityDisplay);
  card.appendChild(tempDisplay);
  card.appendChild(humidityDisplay);
  card.appendChild(descDisplay);
  card.appendChild(emojiDisplay);
}

function mapIconToEmoji(icon) {
  icon = icon.toLowerCase();
  if (icon.includes("rain"))    return "🌧️";
  if (icon.includes("snow"))    return "❄️";
  if (icon.includes("thunder")) return "⛈️";
  if (icon.includes("fog") 
   || icon.includes("mist")
   || icon.includes("haze"))   return "🌫️";
  if (icon.includes("clear"))   return "☀️";
  if (icon.includes("cloud"))   return "☁️";
  return "❓";
}

function displayError(message) {
  card.innerHTML = "";
  card.style.display = "flex";
  const errorDisplay = document.createElement("p");
  errorDisplay.textContent = message;
  errorDisplay.classList.add("errorDisplay");
  card.appendChild(errorDisplay);
}
