
import { useEffect, useRef, useState } from "react";
import clear_icon from "./assets/clear.png";
import drizzle_icon from "./assets/drizzle.png";
import humidity_icon from "./assets/humidity.png";
import rain_icon from "./assets/rain.png";
import search_icon from "./assets/search.png";
import snow_icon from "./assets/snow.png";
import wind_icon from "./assets/wind.png";
import "./weather.css"; 

const Weather = () => {
  const inputRef = useRef();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const conditionMap = {
    Clear: clear_icon,
    Sunny: clear_icon,
    Cloud: drizzle_icon,
    Clouds: drizzle_icon,
    Rain: rain_icon,
    Drizzle: drizzle_icon,
    Snow: snow_icon
  };

  const getIconForCondition = (conditionText, conditionIconUrl) => {
    for (let key of Object.keys(conditionMap)) {
      if (conditionText.toLowerCase().includes(key.toLowerCase())) {
        return conditionMap[key];
      }
    }
    if (conditionIconUrl) {
      if (conditionIconUrl.startsWith("//")) return "https:" + conditionIconUrl;
      if (conditionIconUrl.startsWith("http")) return conditionIconUrl;
    }
    return clear_icon;
  };

  const search = async (city) => {
    if (!city || city.trim() === "") {
      alert("Please enter a city name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_API_KEY;
      console.log("VITE_API_KEY =", apiKey); 

      if (!apiKey) {
        throw new Error(
          "API key not found. Make sure .env is at project root and server was restarted."
        );
      }

      const url = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${encodeURIComponent(
        city
      )}&aqi=no`;

      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        const message = data.error?.message || `HTTP ${response.status}`;
        setWeatherData(null);
        setError(message);
        alert(message);
        return;
      }

      const conditionText = data.current?.condition?.text || "";
      const conditionIconUrl = data.current?.condition?.icon || "";
      const icon = getIconForCondition(conditionText, conditionIconUrl);

      setWeatherData({
        humidity: data.current?.humidity ?? "-",
        windSpeed: data.current?.wind_kph ?? "-",
        temperature: Math.round(data.current?.temp_c ?? 0),
        location:
          (data.location?.name || "") +
          (data.location?.region ? `, ${data.location.region}` : ""),
        icon: icon
      });
    } catch (err) {
      console.error("Error fetching weather:", err);
      setWeatherData(null);
      setError(err.message || "Error fetching weather data. Please try again.");
      alert(err.message || "Error fetching weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    search("Hyderabad");
  }, []);

  return (
    <div className="weather">
      <div className="search-bar">
        <input ref={inputRef} type="text" placeholder="Search here" />
        <img
          src={search_icon}
          alt="search_icon"
          onClick={() => search(inputRef.current?.value)}
          style={{ cursor: "pointer" }}
        />
      </div>

      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}

      {weatherData && !loading && !error ? (
        <>
          <img
            src={weatherData.icon}
            alt="weather_icon"
            className="weather-icon"
          />
          <p className="temperature">{weatherData.temperature}°C</p>
          <p className="location">{weatherData.location}</p>

          <div className="weather-data">
            <div className="col">
              <img src={humidity_icon} alt="humidity_icon" />
              <div>
                <p>{weatherData.humidity} %</p>
                <span>Humidity</span>
              </div>
            </div>
            <div className="col">
              <img src={wind_icon} alt="wind_icon" />
              <div>
                <p>{weatherData.windSpeed} Km/h</p>
                <span>Wind Speed</span>
              </div>
            </div>
          </div>
        </>
      ) : (
        !loading &&
        !error && <p>No data available. Please search for a city.</p>
      )}
    </div>
  );
};

export default Weather; 
