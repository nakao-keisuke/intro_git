export interface HourlyWeather {
  time: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  precipitation: number;
}

export interface DailyWeather {
  date: string;
  tempMax: number;
  tempMin: number;
  weatherCode: number;
  precipitationSum: number;
  windSpeedMax: number;
}

export interface CurrentWeather {
  temperature: number;
  windSpeed: number;
  weatherCode: number;
  humidity: number;
  apparentTemperature: number;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  locationName: string;
}
