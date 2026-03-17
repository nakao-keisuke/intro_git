import { WeatherData, HourlyWeather, DailyWeather } from "../types/weather";

const BASE_URL = "https://api.open-meteo.com/v1/forecast";

export function getWeatherDescription(code: number): string {
  const descriptions: Record<number, string> = {
    0: "快晴", 1: "晴れ", 2: "一部曇り", 3: "曇り",
    45: "霧", 48: "着氷性の霧",
    51: "弱い霧雨", 53: "霧雨", 55: "強い霧雨",
    61: "弱い雨", 63: "雨", 65: "強い雨",
    71: "弱い雪", 73: "雪", 75: "強い雪",
    80: "にわか雨", 81: "にわか雨(強)", 82: "激しいにわか雨",
    95: "雷雨", 96: "雹を伴う雷雨", 99: "激しい雹を伴う雷雨",
  };
  return descriptions[code] || "不明";
}

export function getWeatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 2) return "⛅";
  if (code === 3) return "☁️";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 75) return "🌨️";
  if (code <= 82) return "🌧️";
  if (code <= 99) return "⛈️";
  return "🌡️";
}

export async function fetchWeather(
  latitude: number = 35.6762,
  longitude: number = 139.6503
): Promise<WeatherData> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",
    hourly: "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation",
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max",
    timezone: "Asia/Tokyo",
    forecast_days: "7",
  });

  const response = await fetch(`${BASE_URL}?${params}`);
  if (!response.ok) throw new Error(`Weather API error: ${response.status}`);
  const data = await response.json();

  const now = new Date();
  const currentHourIndex = now.getHours();

  const hourly: HourlyWeather[] = data.hourly.time
    .slice(currentHourIndex, currentHourIndex + 24)
    .map((time: string, i: number) => ({
      time,
      temperature: data.hourly.temperature_2m[currentHourIndex + i],
      humidity: data.hourly.relative_humidity_2m[currentHourIndex + i],
      windSpeed: data.hourly.wind_speed_10m[currentHourIndex + i],
      weatherCode: data.hourly.weather_code[currentHourIndex + i],
      precipitation: data.hourly.precipitation[currentHourIndex + i],
    }));

  const daily: DailyWeather[] = data.daily.time.map((date: string, i: number) => ({
    date,
    tempMax: data.daily.temperature_2m_max[i],
    tempMin: data.daily.temperature_2m_min[i],
    weatherCode: data.daily.weather_code[i],
    precipitationSum: data.daily.precipitation_sum[i],
    windSpeedMax: data.daily.wind_speed_10m_max[i],
  }));

  return {
    current: {
      temperature: data.current.temperature_2m,
      windSpeed: data.current.wind_speed_10m,
      weatherCode: data.current.weather_code,
      humidity: data.current.relative_humidity_2m,
      apparentTemperature: data.current.apparent_temperature,
    },
    hourly,
    daily,
    locationName: "東京",
  };
}
