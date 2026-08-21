// Define the expected shapes of the API responses
interface GeocodingResponse {
  results?: Array<{
    name: string;
    country: string;
    latitude: number;
    longitude: number;
  }>;
}

interface WeatherResponse {
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  current_units: {
    temperature_2m: string;
    wind_speed_10m: string;
  };
}

export async function getCityWeather({ cityName }: { cityName: string }) {
  console.log(
    "-------------------------------getCityWeather-------------------------------",
  );
  console.log(cityName);

  try {
    // Step 1: Resolve the city name to coordinates
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cityName,
    )}&count=1&language=en&format=json`;

    const geoResponse = await fetch(geoUrl);
    if (!geoResponse.ok) throw new Error("Failed to fetch location data");

    const geoData = (await geoResponse.json()) as GeocodingResponse;

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`City "${cityName}" not found.`);
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    // Step 2: Fetch current weather using those coordinates
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,wind_speed_10m,weather_code`;

    const weatherResponse = await fetch(weatherUrl);
    if (!weatherResponse.ok) throw new Error("Failed to fetch weather data");

    const weatherData = (await weatherResponse.json()) as WeatherResponse;
    const { current, current_units } = weatherData;

    // Return a clean, formatted object
    return {
      location: `${name}, ${country}`,
      temperature: `${current.temperature_2m}${current_units.temperature_2m}`,
      windSpeed: `${current.wind_speed_10m} ${current_units.wind_speed_10m}`,
      weatherCode: current.weather_code,
    };
  } catch (error) {
    console.error("Error fetching weather:", error);
    throw error;
  }
}

// Example usage:
// getCityWeather("London").then(console.log);
