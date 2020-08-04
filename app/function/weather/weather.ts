import $register = require("wxpage");
import { WeatherData, WeatherDetail } from "../../components/weather/typings";
import { AppOption } from "../../app";
import weatherHandler from "../../components/weather/handler";

const { globalData } = getApp<AppOption>();

$register("weather", {
  data: {
    /** 天气数据 */
    weather: {} as WeatherDetail,
    /** 当前tips的索引值 */
    tipIndex: 0,
    /** 动画对象 */
    animation: {},
  },

  onLoad() {
    const weatherData = wx.getStorageSync("weather");

    // 如果天气数据获取时间小于5分钟，则可以使用
    if (weatherData.date > new Date().getTime() - 300000) {
      const weather = weatherData.data as WeatherDetail;

      this.initcanvas(weather);

      this.setData({
        weather,
        // 18点至次日5点为夜间
        night: new Date().getHours() > 18 || new Date().getHours() < 5,

        firstPage: getCurrentPages().length === 1,
        info: globalData.info,
        darkmode: globalData.darkmode,
      });
    } // 否则需要重新获取并处理
    else
      wx.request({
        url: "https://v3.mp.innenu.com/service/weather.php",
        enableHttp2: true,
        success: (res) => {
          const weather = weatherHandler((res.data as WeatherData).data);

          this.initcanvas(weather);

          this.setData({
            weather,
            // 18点至次日5点为夜间
            night: new Date().getHours() > 18 || new Date().getHours() < 5,

            firstPage: getCurrentPages().length === 1,
            info: globalData.info,
            darkmode: globalData.darkmode,
          });
        },
      });

    // 设置页面背景色
    wx.setBackgroundColor({
      backgroundColorTop: globalData.darkmode ? "#000000" : "#efeef4",
      backgroundColor: globalData.darkmode ? "#000000" : "#efeef4",
      backgroundColorBottom: globalData.darkmode ? "#000000" : "#efeef4",
    });

    wx.onWindowResize(this.redrawCanvas);
    this.backgroundChange();

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);
  },

  onShareAppMessage: () => ({
    title: "东师天气",
    path: "/function/weather/weather",
  }),

  onShareTimeline: () => ({ title: "东师天气" }),

  onUnload() {
    /** 移除旋转屏幕与加速度计监听 */
    wx.offWindowResize(this.redrawCanvas);
    wx.stopAccelerometer({
      success: () => console.info("stop accelerometer listening success"),
    });
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /**
   * 绘制温度曲线
   *
   * @param weather 天气详情
   */
  // eslint-disable-next-line
  initcanvas(weather: WeatherDetail) {
    if (wx.canIUse("canvas.type"))
      wx.createSelectorQuery()
        .select(".canvas")
        .fields({
          node: true,
          size: true,
        })
        .exec((res) => {
          const canvas = res[0].node;
          const context = canvas.getContext("2d");
          const dpr = globalData.info.pixelRatio;

          canvas.width = res[0].width * dpr;
          canvas.height = res[0].height * dpr;
          context.scale(dpr, dpr);
          this.draw(context, weather);
        });
    else this.canvasOldDraw(weather);
  },

  // eslint-disable-next-line
  draw(canvasContent: WechatMiniprogram.CanvasContext, weather: WeatherDetail) {
    // 为了防止 iPad 等设备可以转屏，必须即时获取
    const width = globalData.info.windowWidth;
    const highTemperature: number[] = [];
    const lowTemperature: number[] = [];
    const { dayForecast } = weather;
    let max = -50;
    let min = 50;

    // 生成最高 / 最低温
    dayForecast.forEach((element) => {
      const maxDegreee = Number(element.max_degree);
      const minDegree = Number(element.min_degree);

      highTemperature.push(maxDegreee);
      lowTemperature.push(minDegree);
      if (maxDegreee > max) max = maxDegreee;
      if (minDegree < min) min = minDegree;
    });

    /** 温差 */
    const gap = max - min;

    canvasContent.beginPath();
    canvasContent.lineWidth = 2;
    canvasContent.font = "16px sans-serif";

    canvasContent.strokeStyle = "#ffb74d";
    canvasContent.fillStyle = "#ffb74d";

    // 绘制高温曲线
    for (let i = 0; i < dayForecast.length; i += 1) {
      const x = width / 10 + (i * width) / 5;
      const y = ((max - highTemperature[i]) / gap) * 100;

      if (i === 0) canvasContent.moveTo(x, y + 32);
      else canvasContent.lineTo(x, y + 32);
    }
    canvasContent.stroke();

    // 绘制高温度数值与点
    for (let i = 0; i < dayForecast.length; i += 1) {
      const x = width / 10 + (i * width) / 5;
      const y = ((max - highTemperature[i]) / gap) * 100;

      canvasContent.beginPath();
      canvasContent.arc(x, y + 32, 3, 0, Math.PI * 2);
      canvasContent.fill();

      canvasContent.fillText(`${dayForecast[i].max_degree}°`, x - 10, y + 20);
    }

    canvasContent.beginPath();

    canvasContent.strokeStyle = "#4fc3f7";
    canvasContent.fillStyle = "#4fc3f7";

    // 绘制低温曲线
    for (let i = 0; i < dayForecast.length; i += 1) {
      const x = width / 10 + (i * width) / 5;
      const y = ((max - lowTemperature[i]) / gap) * 100;

      if (i === 0) canvasContent.moveTo(x, y + 20);
      else canvasContent.lineTo(x, y + 20);
    }
    canvasContent.stroke();

    // 绘制低温度数值与点
    for (let i = 0; i < dayForecast.length; i += 1) {
      const x = width / 10 + (i * width) / 5;
      const y = ((max - lowTemperature[i]) / gap) * 100;

      canvasContent.beginPath();
      canvasContent.arc(x, y + 20, 3, 0, Math.PI * 2);
      canvasContent.fill();

      canvasContent.fillText(`${dayForecast[i].min_degree}°`, x - 10, y + 44);
    }
  },

  /**
   * 绘制温度曲线
   *
   * @param weather 天气详情
   */
  // eslint-disable-next-line
  canvasOldDraw(weather: WeatherDetail) {
    // 为了防止iPad等设备可以转屏，必须即时获取
    const width = getApp().globalData.info.windowWidth;
    /** 天气画布组件 */
    const canvasContent = wx.createCanvasContext("weather");
    const highTemperature: number[] = [];
    const lowTemperature: number[] = [];
    const { dayForecast } = weather;
    let max = -50;
    let min = 50;

    // 生成最高 / 最低温
    dayForecast.forEach((element) => {
      const maxDegreee = Number(element.max_degree);
      const minDegree = Number(element.min_degree);

      highTemperature.push(maxDegreee);
      lowTemperature.push(minDegree);
      if (maxDegreee > max) max = maxDegreee;
      if (minDegree < min) min = minDegree;
    });

    /** 温差 */
    const gap = max - min;

    canvasContent.beginPath();
    canvasContent.lineWidth = 2;
    canvasContent.font = "16px sans-serif";

    canvasContent.strokeStyle = "#ffb74d";
    canvasContent.fillStyle = "#ffb74d";

    // 绘制高温曲线
    for (let i = 0; i < dayForecast.length; i += 1) {
      const x = width / 10 + (i * width) / 5;
      const y = ((max - highTemperature[i]) / gap) * 100;

      if (i === 0) canvasContent.moveTo(x, y + 32);
      else canvasContent.lineTo(x, y + 32);
    }
    canvasContent.stroke();
    canvasContent.draw();

    // 绘制高温度数值与点
    for (let i = 0; i < dayForecast.length; i += 1) {
      const x = width / 10 + (i * width) / 5;
      const y = ((max - highTemperature[i]) / gap) * 100;

      canvasContent.beginPath();
      canvasContent.arc(x, y + 32, 3, 0, Math.PI * 2);
      canvasContent.fill();
      canvasContent.draw(true);

      canvasContent.fillText(`${dayForecast[i].max_degree}°`, x - 10, y + 20);
      canvasContent.draw(true);
    }

    canvasContent.beginPath();

    canvasContent.strokeStyle = "#4fc3f7";
    canvasContent.fillStyle = "#4fc3f7";

    // 绘制低温曲线
    for (let i = 0; i < dayForecast.length; i += 1) {
      const x = width / 10 + (i * width) / 5;
      const y = ((max - lowTemperature[i]) / gap) * 100;

      if (i === 0) canvasContent.moveTo(x, y + 20);
      else canvasContent.lineTo(x, y + 20);
    }
    canvasContent.stroke();
    canvasContent.draw(true);

    // 绘制低温度数值与点
    for (let i = 0; i < dayForecast.length; i += 1) {
      const x = width / 10 + (i * width) / 5;
      const y = ((max - lowTemperature[i]) / gap) * 100;

      canvasContent.beginPath();
      canvasContent.arc(x, y + 20, 3, 0, Math.PI * 2);
      canvasContent.fill();
      canvasContent.draw(true);

      canvasContent.fillText(`${dayForecast[i].min_degree}°`, x - 10, y + 44);
      canvasContent.draw(true);
    }
  },

  /** 旋转屏幕时重绘画布 */
  redrawCanvas() {
    if (wx.canIUse("canvas.type"))
      wx.createSelectorQuery()
        .select(".canvas")
        .fields({
          node: true,
          size: true,
        })
        .exec((res) => {
          this.draw(res[0].node.getContext("2d"), this.data.weather);
        });
    else this.canvasOldDraw(this.data.weather);
  },

  /** 改变背景动画 */
  backgroundChange() {
    /** 动画选项 */
    const animationOptions: WechatMiniprogram.StepOption = {
      duration: 200,
      timingFunction: "ease",
    };
    /** 背景层1动画 */
    const layer1Animation = wx.createAnimation(animationOptions);
    /** 背景层2动画 */
    const layer2Animation = wx.createAnimation(animationOptions);
    /** 背景层3动画 */
    const layer3Animation = wx.createAnimation(animationOptions);

    wx.startAccelerometer({
      interval: "normal",
      success: () => console.info("Start accelerometer listening success"),
    });

    wx.onAccelerometerChange((res) => {
      layer1Animation.translateX(res.x * 13.5).step();
      layer2Animation.translateX(res.x * 18).step();
      layer3Animation.translateX(res.x * 22.5).step();

      this.setData({
        animation1: layer1Animation.export(),
        animation2: layer2Animation.export(),
        animation3: layer3Animation.export(),
      });
    });
  },

  /** 更新提示 */
  refresh() {
    const { length } = Object.keys(this.data.weather.tips.observe);
    const numbers = this.data.tipIndex;

    this.setData({ tipIndex: numbers === 0 ? length - 1 : numbers - 1 });
  },

  /** 返回按钮功能 */
  back() {
    if (getCurrentPages().length === 1) this.$launch("main");
    else this.$back();
  },
});
