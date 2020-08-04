/* eslint-disable camelcase */
import { WeatherData, WeatherDetail } from "./typings";

/**
 * 天气处理函数
 *
 * @param weather API返回的原生天气数据
 * @returns 处理后的可读天气数据
 */
const weatherHandler = (weather: WeatherData["data"]): WeatherDetail => {
  // 暂时只显示24小时天气预报 TODO: 增加日落日出时间
  weather.hourForecast = Object.keys(weather.forecast_1h)
    .map((key) => {
      return weather.forecast_1h[Number(key)];
    })
    .filter((_value, index) => index < 24);

  // 设置天气预报的时间
  weather.dayForecast = Object.keys(weather.forecast_24h).map((key) => {
    const index = Number(key);

    weather.forecast_24h[index].weekday =
      index === 0
        ? "昨天"
        : index === 1
        ? "今天"
        : index === 2
        ? "明天"
        : index === 3
        ? "后天"
        : `星期${
            [
              "天",
              "一",
              "二",
              "三",
              "四",
              "五",
              "六",
              "天",
              "一",
              "二",
              "三",
              "四",
              "五",
            ][new Date().getDay() + index - 1]
          }`;

    return weather.forecast_24h[index];
  });

  delete weather.forecast_24h;
  delete weather.forecast_1h;

  return weather;
};

export default weatherHandler;
