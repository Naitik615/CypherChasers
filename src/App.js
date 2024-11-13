import React, { useState, useEffect } from 'react';

function App() {
  const [weatherData, setWeatherData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);


  const apiKey = 'AIzaSyDzLE8TjrU0qiJFngDPTgasSY4DVWnBnd4'; // Replace with your OpenWeather API key

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          'https://api.openweathermap.org/data/2.5/weather?lat=$30.3165&lon=$78.0322&appid=$AIzaSyDzLE8TjrU0qiJFngDPTgasSY4DVWnBnd4'
        );
        if (!response.ok) throw new Error('Error fetching weather data');
        const data = await response.json();
        setWeatherData(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWeather();
  }, []); // Empty dependency array means this runs only on mount

  return (
    <div style={{ width: '100%', height: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {isLoading ? (
        <p>Loading weather data...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        weatherData && (
          <div>
            <h3>Weather in {weatherData.name}</h3>
            <p>Temperature: {(weatherData.main.temp - 273.15).toFixed(2)}°C</p>
            <p>Weather: {weatherData.weather[0].description}</p>
          </div>
        )
      )}

      <iframe
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3447.363434467523!2d78.03218851510516!3d30.316494681790756!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39092932d109efc9%3A0x40325f75e0a07e8!2sDehradun%2C%20Uttarakhand%2C%20India!5e0!3m2!1sen!2sus!4v1614780000000!5m2!1sen!2sus"
        width="100%"
        height="300px"
        style={{ border: 1 }}
        allowFullScreen=""
        loading="lazy"
      ></iframe>
    </div>
  );
}

export default App;
