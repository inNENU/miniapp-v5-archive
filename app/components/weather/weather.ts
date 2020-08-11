import $register = require("wxpage");
import weatherHandler from "./handler";
import { WeatherData, WeatherDetail } from "./typings";
import { server } from "../../utils/config";

$register.C({
  data: {
    /** 提示的索引值 */
    tipIndex: 0,
    /** 天气信息 */
    weather: {} as WeatherDetail,
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
        url: `${server}service/weather.php`,
        enableHttp2: true,
        success: (res) => {
          const weather = weatherHandler((res.data as WeatherData).data);

          this.setData({ weather });

          // 将天气详情和获取时间写入存储，避免重复获取
          wx.setStorageSync("weather", {
            data: weather,
            date: new Date().getTime(),
          });
        },
      });
    },
  },
});
