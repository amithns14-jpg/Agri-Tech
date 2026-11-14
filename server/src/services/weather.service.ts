// Native fetch based weather service adapter
import { env } from '../config/env.js';

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  wind_speed: number;
  weather_condition: string;
  is_live: boolean;
  provider: string;
  recorded_at: string;
  forecast?: Array<{
    date: string;
    temperature_max: number;
    temperature_min: number;
    humidity: number;
    rainfall_chance: number;
    condition: string;
  }>;
  agricultural_insights: {
    sowing_suitability: string;
    irrigation_adjustment: string;
    spraying_advisory: string;
    fertilizer_advisory: string;
    extreme_weather_alert?: string;
  };
}

export class WeatherService {
  private apiKey = env.WEATHER_API_KEY;
  private baseUrl = env.WEATHER_API_BASE_URL;

  async getCurrentWeather(location: string, state?: string): Promise<WeatherData> {
    const queryLocation = state ? `${location}, ${state}, IN` : `${location}, IN`;

    if (env.isWeatherConfigured) {
      try {
        const url = new URL(`${this.baseUrl}/weather`);
        url.searchParams.append('q', queryLocation);
        url.searchParams.append('appid', this.apiKey);
        url.searchParams.append('units', 'metric');

        const res = await fetch(url.toString(), { signal: AbortSignal.timeout(5000) });
        if (!res.ok) throw new Error(`Weather API returned ${res.status}`);
        const data: any = await res.json();
        const temp = data.main.temp;
        const humidity = data.main.humidity;
        const wind = data.wind.speed * 3.6; // convert m/s to km/h
        const rain = data.rain ? (data.rain['1h'] || data.rain['3h'] || 0) : 0;
        const condition = data.weather[0]?.main || 'Clear';

        return {
          location: data.name || location,
          temperature: Math.round(temp * 10) / 10,
          humidity,
          rainfall: rain,
          wind_speed: Math.round(wind * 10) / 10,
          weather_condition: condition,
          is_live: true,
          provider: 'OpenWeather API',
          recorded_at: new Date().toISOString(),
          agricultural_insights: this.deriveAgriculturalInsights(temp, humidity, rain, wind, condition)
        };
      } catch (err: any) {
        console.warn(`[WeatherService] Live weather API unavailable for ${queryLocation}:`, err.message);
      }
    }

    // Honest fallback based on regional agro-climatic seasonal characteristics
    return this.getAgroClimaticEstimate(location, state);
  }

  async getForecast(location: string, state?: string): Promise<WeatherData> {
    const current = await this.getCurrentWeather(location, state);

    if (env.isWeatherConfigured) {
      try {
        const query = state ? `${location}, ${state}, IN` : `${location}, IN`;
        const url = new URL(`${this.baseUrl}/forecast`);
        url.searchParams.append('q', query);
        url.searchParams.append('appid', this.apiKey);
        url.searchParams.append('units', 'metric');

        const res = await fetch(url.toString(), { signal: AbortSignal.timeout(6000) });
        if (!res.ok) throw new Error(`Forecast API returned ${res.status}`);
        const forecastData: any = await res.json();

        // Group into daily forecast
        const list = forecastData.list || [];
        const dailyMap = new Map<string, any>();

        for (const item of list) {
          const date = item.dt_txt.split(' ')[0];
          if (!dailyMap.has(date)) {
            dailyMap.set(date, {
              date,
              temperature_max: item.main.temp_max,
              temperature_min: item.main.temp_min,
              humidity: item.main.humidity,
              rainfall_chance: item.pop ? Math.round(item.pop * 100) : 0,
              condition: item.weather[0]?.main || 'Clear'
            });
          }
        }

        current.forecast = Array.from(dailyMap.values()).slice(0, 5);
        return current;
      } catch (err: any) {
        console.warn('[WeatherService] Forecast API unavailable:', err.message);
      }
    }

    // 5-day estimated seasonal outlook
    const baseDate = new Date();
    current.forecast = [1, 2, 3, 4, 5].map(offset => {
      const d = new Date(baseDate);
      d.setDate(d.getDate() + offset);
      return {
        date: d.toISOString().split('T')[0],
        temperature_max: Math.round((current.temperature + (Math.sin(offset) * 2)) * 10) / 10,
        temperature_min: Math.round((current.temperature - 6 + (Math.cos(offset) * 2)) * 10) / 10,
        humidity: Math.max(30, Math.min(90, current.humidity + Math.round(Math.sin(offset) * 5))),
        rainfall_chance: current.rainfall > 0 ? 60 : 15,
        condition: current.weather_condition
      };
    });

    return current;
  }

  private deriveAgriculturalInsights(
    temp: number,
    humidity: number,
    rain: number,
    wind: number,
    condition: string
  ) {
    let sowing = 'Favorable soil and temperature conditions for active sowing and field preparation.';
    let irrigation = 'Normal irrigation schedule recommended.';
    let spraying = 'Wind conditions suitable for pesticide/foliar spraying.';
    let fertilizer = 'Conditions are dry enough for top-dressing fertilizer application.';
    let extremeAlert: string | undefined;

    if (rain > 5) {
      sowing = 'Heavy soil wetness; postpone mechanical sowing until field reaches field capacity.';
      irrigation = 'Skip or pause scheduled irrigation to avoid waterlogging and root rot.';
      spraying = 'Avoid pesticide spraying as rainfall will wash away chemicals.';
      fertilizer = 'Do NOT apply urea or surface nitrogen; high runoff and leaching risk.';
    } else if (rain > 0.5) {
      irrigation = 'Reduce irrigation quantity by 30-50% taking recent drizzle into account.';
    }

    if (wind > 15) {
      spraying = 'High wind alert (>15 km/h): Do NOT spray chemicals; high drift risk to neighboring areas.';
    }

    if (temp > 40) {
      extremeAlert = 'High heatwave alert: Apply light frequent irrigation or mulching to prevent heat stress in crops.';
      irrigation = 'Irrigate during evening or night hours only to reduce evaporative loss.';
    } else if (temp < 10) {
      extremeAlert = 'Low temperature alert: Risk of frost or slow germination. Protect young nursery seedlings.';
    }

    if (humidity > 85 && temp > 25) {
      extremeAlert = 'High humidity + heat alert: High risk of fungal leaf spots, downy mildew, and blast disease. Monitor crops daily.';
    }

    return {
      sowing_suitability: sowing,
      irrigation_adjustment: irrigation,
      spraying_advisory: spraying,
      fertilizer_advisory: fertilizer,
      extreme_weather_alert: extremeAlert
    };
  }

  private getAgroClimaticEstimate(location: string, state?: string): WeatherData {
    // Current month determination
    const month = new Date().getMonth(); // 0 = Jan, 5 = Jun, 10 = Nov
    let temp = 28;
    let humidity = 65;
    let rain = 0;
    let condition = 'Partly Cloudy';

    // Winter (Nov - Feb)
    if (month >= 10 || month <= 1) {
      temp = 24;
      humidity = 55;
      condition = 'Clear / Sunny';
    } 
    // Summer (Mar - May)
    else if (month >= 2 && month <= 4) {
      temp = 36;
      humidity = 45;
      condition = 'Hot / Sunny';
    } 
    // Monsoon (Jun - Sep)
    else {
      temp = 29;
      humidity = 82;
      rain = 4.2;
      condition = 'Overcast / Light Rain';
    }

    return {
      location: state ? `${location}, ${state}` : location,
      temperature: temp,
      humidity,
      rainfall: rain,
      wind_speed: 9.5,
      weather_condition: condition,
      is_live: false,
      provider: 'Agro-Climatic Seasonal Reference (Configure WEATHER_API_KEY for live radar)',
      recorded_at: new Date().toISOString(),
      agricultural_insights: this.deriveAgriculturalInsights(temp, humidity, rain, 9.5, condition)
    };
  }
}

export const weatherService = new WeatherService();
