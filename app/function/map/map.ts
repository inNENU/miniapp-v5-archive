import $register = require("wxpage");

import { AppOption } from "../../app";
import { Category, MarkerConfig, MarkerData } from "../../../typings";

import { server } from "../../utils/config";
import { ensureJSON, getJSON } from "../../utils/file";
import { popNotice } from "../../utils/page";
import { modal, tip } from "../../utils/wx";

const { globalData } = getApp<AppOption>();

/** 本部栅格 */
const benbuArea = {
  padding: [30, 20, 30, 20],
  points: [
    { latitude: 43.8578480844, longitude: 125.3252720833 },
    { latitude: 43.8633404949, longitude: 125.3379964828 },
  ],
};

/** 本部栅格 */
const jingyueArea = {
  padding: [30, 20, 30, 20],
  points: [
    { latitude: 43.8256570334, longitude: 125.4175829887 },
    { latitude: 43.8247281876, longitude: 125.4359936714 },
  ],
};

type Area = "benbu" | "jingyue";

$register("map", {
  data: {
    /** 夜间模式状态 */
    darkmode: globalData.darkmode,

    /** 地图数据 */
    map: {
      latitude: 43.862007982140646,
      longitude: 125.33405307523934,
      scale: 17,
    },

    /** 显示弹窗 */
    showPopup: false,

    popup: {
      title: "全部",
      subtitle: "地点列表",
      cancel: false,
      confirm: false,
    },

    /** 点分类显示状态 */
    pointDisplay: false,

    /** 当前分类 */
    currentCategory: "all",

    /** 校区 */
    area: "benbu" as Area,

    /** 点位分类 */
    category: [] as Category[],

    /** 地图点位 */
    markers: [] as MarkerData[],
  },

  /** 状态 */
  state: {
    gestureHold: false,
    isSet: false,
    benbu: {
      category: [] as Category[],
      marker: {} as Record<string, MarkerData[]>,
    },
    jingyue: {
      category: [] as Category[],
      marker: {} as Record<string, MarkerData[]>,
    },
  },

  onNavigate() {
    console.info("将要跳转 Map");
    ensureJSON({
      path: "function/map/marker/benbu",
      url: "resource/function/map/marker/benbu",
    });
    ensureJSON({
      path: "function/map/marker/jingyue",
      url: "resource/function/map/marker/jingyue",
    });
  },

  onLoad() {
    wx.showLoading({ title: "加载中..." });
    const area = this.getArea();

    this.setData({
      area,
      /** 地图风格 */
      mapStyle: globalData.darkmode
        ? "46NBZ-EJ6C4-4REUO-XR7ZR-CWLG5-T3BDA"
        : "PZGBZ-74N6F-KVYJ5-NRJDH-Y3NUT-IKFLF",

      /** 设备信息 */
      info: globalData.info,
      darkmode: globalData.darkmode,
      firstPage: getCurrentPages().length === 1,
    });

    this.setMarker();

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);

    popNotice("map");
  },

  onReady() {
    // 创建地图对象
    const mapCtx = wx.createMapContext("map");

    // 将地图缩放到对应的校区
    mapCtx.includePoints(this.data.area === "benbu" ? benbuArea : jingyueArea);

    // 将地图写入 options 实例中
    this.mapCtx = mapCtx;
    // 1000ms 之后拿到缩放值和地图中心点坐标，写入地图组件配置
    setTimeout(() => {
      this.setMap();
    }, 1000);

    wx.hideLoading();
  },

  onShareAppMessage: () => ({ title: "东师地图", path: "/function/map/map" }),

  onShareTimeline: () => ({ title: "东师地图" }),

  onAddToFavorites: () => ({
    title: "东师地图",
    imageUrl: `${server}img/${
      globalData.appID === "wx9ce37d9662499df3" ? "myNENU" : "inNENU"
    }.jpg`,
  }),

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /** 设置地图 */
  setMap() {
    this.mapCtx.getScale({
      success: (r1) => {
        this.mapCtx.getCenterLocation({
          success: (r2) => {
            this.setData({
              map: {
                scale: r1.scale,
                latitude: r2.latitude,
                longitude: r2.longitude,
              },
            });
          },
        });
      },
    });
  },

  /** 获得当前校区 */
  getArea(): Area {
    const value = wx.getStorageSync("map-area") as Area | undefined;

    if (value) return value;

    wx.setStorageSync("map-area", "benbu");

    return "benbu";
  },

  /** 生成点位 */
  setMarker() {
    const promises = ["benbu", "jingyue"].map(
      (path) =>
        new Promise<void>((resolve) => {
          getJSON<MarkerConfig>({
            path: `function/map/marker/${path}`,
            url: `resource/function/map/marker/${path}`,
            success: (markerData) => {
              this.state[path as Area] = markerData;

              resolve();
            },
            fail: () => {
              modal(
                "获取失败",
                "地图点位获取失败，请稍后重试。如果该情况持续发生，请反馈给开发者",
                () => this.back()
              );
            },
          });
        })
    );

    Promise.all(promises).then(() => {
      const markerConfig = this.state[this.data.area];

      this.setData({
        category: markerConfig.category,
        markers: markerConfig.marker.all,
      });
    });
  },

  changeArea() {
    const area = this.data.area === "benbu" ? "jingyue" : "benbu";
    const markers = this.state[area].marker[this.data.currentCategory];

    this.setData({ area, markers });

    // 重新缩放校区
    this.mapCtx.includePoints(area === "benbu" ? benbuArea : jingyueArea);

    // 1000ms 之后拿到缩放值和地图中心点坐标，写入地图组件配置
    setTimeout(() => {
      this.setMap();
    }, 1000);

    wx.setStorageSync("map-area", area);
  },

  /**
   * 获取缩放值
   *
   * @param event 触摸事件
   */
  scale(event: WechatMiniprogram.TouchEvent) {
    this.mapCtx.getCenterLocation({
      success: (res) => {
        this.setData({
          map: {
            scale:
              this.data.map.scale +
              (event.currentTarget.dataset.action === "enlarge" ? 1 : -1),
            latitude: res.latitude,
            longitude: res.longitude,
          },
        });
      },
    });
  },

  /** 移动到当前坐标 */
  moveToLocation() {
    this.mapCtx.moveToLocation();
  },

  /** 展示分类选择 */
  point() {
    this.setData({ pointDisplay: !this.data.pointDisplay });
  },

  /** 选择分类 */
  select({ currentTarget }: WechatMiniprogram.TouchEvent) {
    const index = currentTarget.dataset.index as number;
    const { name, path } = this.data.category[index];
    const markers = this.state[this.data.area].marker[path];

    this.setData({ currentCategory: path, markers, "popup.title": name });
    this.mapCtx.includePoints({ padding: [30, 20, 30, 20], points: markers });
  },

  markers(event: WechatMiniprogram.MarkerTap) {
    const { area } = this.data;

    const { path } = this.data.markers.find(
      (item) => item.id === event.detail.markerId
    ) as MarkerData;

    if (event.type === "markertap") {
      if (path) this.$preload(`/function/map/location?id=${area}/${path}`);
    } else if (event.type === "callouttap") {
      if (path) this.$route(`/function/map/location?id=${area}/${path}`);
      else tip("该地点暂无详情");
    }
  },

  showPopup() {
    this.setData({ showPopup: true });
  },

  navigate({ currentTarget }: WechatMiniprogram.TouchEvent) {
    const { area } = this.data;

    const { path } = this.data.markers.find(
      (item) => item.id === currentTarget.dataset.id
    ) as MarkerData;

    if (path) this.$route(`/function/map/location?id=${area}/${path}`);
    else tip("该地点暂无详情");
  },

  closePopup() {
    this.setData({ showPopup: false });
  },

  regionChange(event: WechatMiniprogram.RegionChange) {
    console.log(event);
    if (event.causedBy === "gesture" && event.type === "begin")
      this.state.gestureHold = true;

    // 用户对地图进行了缩放或移动
    if (
      (event.causedBy === "scale" || event.causedBy === "drag") &&
      event.type === "end" &&
      this.state.gestureHold
    ) {
      this.mapCtx.getScale({
        success: (res1) => {
          this.mapCtx.getCenterLocation({
            success: (res2) => {
              this.setData({
                map: {
                  scale: res1.scale,
                  latitude: res2.latitude,
                  longitude: res2.longitude,
                },
              });
            },
          });
        },
      });

      this.state.gestureHold = false;
    }
  },

  update(event: WechatMiniprogram.MapUpdated) {
    console.log("update", event);
  },

  back() {
    if (getCurrentPages().length === 1) this.$switch("main");
    else this.$back();
  },

  mapCtx: {} as WechatMiniprogram.MapContext,
});
