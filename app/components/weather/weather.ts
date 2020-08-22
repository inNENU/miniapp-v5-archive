import $register = require("wxpage");
import { WeatherData } from "./typings";
import { server } from "../../utils/config";

$register.C({
  data: {
    /** 提示的索引值 */
    tipIndex: 0,
    /** 天气信息 */
    weather: {} as WeatherData,
  },
  lifetimes: {
    attached(): void {
      this.getWeather();
    },
  },
  methods: {
    /** 变更提示信息 */
    refresh(): void {
      const { length } = Object.keys(this.data.weather.tips.observe);
      const { tipIndex } = this.data;

      this.setData({ tipIndex: tipIndex === 0 ? length - 1 : tipIndex - 1 });
    },
    /* 获取天气信息 */
    getWeather(): void {
      wx.request({
        url: `${server}service/weatherData.php`,
        method: "POST",
        enableHttp2: true,
        success: (res) => {
          // const weather = weatherHandler((res.data as WeatherData).data);

          this.setData({ weather: res.data as WeatherData });

          // 将天气详情和获取时间写入存储，避免重复获取
          wx.setStorageSync("weather", {
            data: res.data as WeatherData,
            date: new Date().getTime(),
          });
        },
      });
    },
  },
});
