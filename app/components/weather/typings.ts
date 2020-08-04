/* eslint-disable camelcase */
/* eslint-disable @typescript-eslint/naming-convention */

/** 一小时天气预报详情 */
export interface WeatherForcast1H {
  /** 摄氏度 */
  degree: string;
  /** 更新时间 */
  update_time: string;
  /** 天气 */
  weather: string;
  /** 天气代码 */
  weather_code: string;
  /** 天气缩写 */
  weather_short: string;
  /** 风向 */
  wind_direction: string;
  /** 风力 */
  wind_power: string;
}

/** 24小时天气预报详情 */
export interface WeatherForcast24H {
  /** 日间天气 */
  day_weather: string;
  /** 日间天气代码 */
  day_weather_code: string;
  /** 日间天气缩写 */
  day_weather_short: string;
  /** 日间风向 */
  day_wind_direction: string;
  /** 日间风向代码 */
  day_wind_direction_code: string;
  /** 日间风力 */
  day_wind_power: string;
  /** 日间风力代码 */
  day_wind_power_code: string;
  /** 最高温 */
  max_degree: string;
  /** 最低温 */
  min_degree: string;
  /** 夜间温度 */
  night_weather: string;
  /** 夜间温度代码 */
  night_weather_code: string;
  /** 夜间温度缩写 */
  night_weather_short: string;
  /** 夜间风向 */
  night_wind_direction: string;
  /** 夜间风向代码 */
  night_wind_direction_code: string;
  /** 夜间风力 */
  night_wind_power: string;
  /** 夜间风力代码 */
  night_wind_power_code: string;
  /** 时间 */
  time: string;
  /** 星期 */
  weekday?: string;
}

/** 天气详情 */
export interface WeatherDetail {
  /** 天气预警 */
  alarm: {
    [props: number]: {
      /** 城市 */
      city: string;
      /** 区域 */
      country: string;
      /** 报警详情 */
      detail: string;
      /** 信息 */
      info: string;
      /** 级别代码 */
      level_code: string;
      /** 级别名称 */
      level_name: string;
      /** 省份 */
      province: string;
      /** 类型代码 */
      type_code: string;
      /** 类型名称 */
      type_name: string;
      /** 更新时间 */
      update_time: string;
      /** 对应地址 */
      url: string;
    };
  };
  /** 1小时天气预报 */
  forecast_1h: {
    [props: number]: WeatherForcast1H;
  };
  /** 24小时天气预报 */
  forecast_24h: {
    [props: number]: WeatherForcast24H;
  };
  /** 实时数据 */
  observe: {
    /** 温度 */
    degree: string;
    /** 湿度 */
    humidity: string;
    /** 降水量 */
    precipitation: string;
    /** 压力 */
    pressure: string;
    /** 更新时间 */
    update_time: string;
    /** 天气 */
    weather: string;
    /** 天气代码 */
    weather_code: string;
    /** 天气缩写 */
    weather_short: string;
    /** 风向 */
    wind_direction: string;
    /** 风力 */
    wind_power: string;
  };
  /** 日出日落时间 */
  rise: {
    [props: number]: {
      /** 日出时间 */
      sunrise: string;
      /** 日落时间 */
      sunset: string;
      /** 日期 */
      time: string;
    };
  };
  tips: {
    observe: {
      [props: number]: string;
    };
  };
  /** 小时预报 */
  hourForecast?: WeatherForcast1H[];
  /** 天预报 */
  dayForecast: WeatherForcast24H[];
}

export interface WeatherData {
  /** 天气数据 */
  data: WeatherDetail;
  message: string;
  status: number;
}
