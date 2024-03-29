import { $Page } from "@mptool/enhance";

import { getWindowInfo, modal, tip } from "../../utils/api";
import { appCoverPrefix } from "../../utils/config";
import { ensureJSON, getJSON } from "../../utils/json";
import { popNotice } from "../../utils/page";

import type { AppOption } from "../../app";
import type { Category, MarkerConfig, MarkerData } from "../../../typings";

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

$Page("map", {
  data: {
    /** 夜间模式状态 */
    darkmode: globalData.darkmode,

    /** 地图数据 */
    map: {
      latitude: 43.862007982140646,
      longitude: 125.33405307523934,
      scale: 17,
    },

    /** 显示地点列表 */
    showLocation: false,
    /** 显示导航 */
    showNavigate: false,
    /** 显示卫星图 */
    showSatellite: false,

    /** 弹窗设置 */
    locationPopup: {
      title: "全部",
      subtitle: "地点列表",
      cancel: false,
      confirm: false,
    },
    navigatePopup: {
      title: "导航",
      cancel: false,
      confirm: false,
    },

    /** 当前分类 */
    currentCategory: "all",

    /** 校区 */
    area: <Area>"benbu",

    /** 点位分类 */
    category: <Category[]>[],

    /** 地图点位 */
    marker: <Record<string, MarkerData[]>>{},
  },

  /** 状态 */
  state: {
    gestureHold: false,
    isSet: false,
    benbu: {
      category: <Category[]>[],
      marker: <Record<string, MarkerData[]>>{},
    },
    jingyue: {
      category: <Category[]>[],
      marker: <Record<string, MarkerData[]>>{},
    },
  },

  context: <WechatMiniprogram.MapContext>{},

  onNavigate() {
    console.info("Navigating to Map");
    ensureJSON("function/map/marker/benbu");
    ensureJSON("function/map/marker/jingyue");
  },

  onLoad() {
    wx.showLoading({ title: "加载中...", mask: true });

    const area = this.getArea();
    // 创建地图对象
    const mapContext = wx.createMapContext("map");
    const info = getWindowInfo();

    // 注入地图实例
    this.context = mapContext;

    this.setData({
      area,
      darkmode: globalData.darkmode,
      statusBarHeight: info.statusBarHeight,
      tabHeight: info.windowHeight / 2 - 20,
      firstPage: getCurrentPages().length === 1,
    });

    popNotice("map");
  },

  onReady() {
    this.setMarker().then(() => {
      // 将地图缩放到对应的校区
      this.context.includePoints(
        this.data.area === "benbu" ? benbuArea : jingyueArea
      );

      // 1200ms 之后拿到缩放值和地图中心点坐标，写入地图组件配置
      setTimeout(() => {
        this.setMap();
      }, 1200);

      wx.hideLoading();
    });
  },

  onShareAppMessage: () => ({ title: "东师地图", path: "/function/map/map" }),

  onShareTimeline: () => ({ title: "东师地图" }),

  onAddToFavorites: () => ({
    title: "东师地图",
    imageUrl: `${appCoverPrefix}.jpg`,
  }),

  onResize({ size }) {
    this.setData({
      tabHeight: size.windowHeight / 2 - 20,
    });
  },

  /** 设置地图 */
  setMap() {
    this.context.getScale({
      success: ({ scale }) => {
        this.context.getCenterLocation({
          success: ({ latitude, longitude }) => {
            this.setData({ map: { scale, latitude, longitude } });
          },
        });
      },
    });
  },

  /** 获得当前校区 */
  getArea(): Area {
    const value = wx.getStorageSync<Area | undefined>("map-area");

    if (value) return value;

    wx.setStorageSync("map-area", "benbu");

    return "benbu";
  },

  /** 生成点位 */
  setMarker() {
    const promises = ["benbu", "jingyue"].map((path) =>
      getJSON<MarkerConfig>(`function/map/marker/${path}`)
        .then((markerData) => {
          this.state[path as Area] = markerData;
        })
        .catch((err) => {
          console.log("Marked failed with", err);
          modal(
            "获取失败",
            "地图点位获取失败，请稍后重试。如果该情况持续发生，请反馈给开发者",
            () => this.back()
          );
        })
    );

    return Promise.all(promises).then(() => {
      const { category, marker } = this.state[this.data.area];

      return new Promise<void>((resolve) =>
        this.setData({ category, marker }, resolve)
      );
    });
  },

  changeSatellite() {
    this.setData({
      showSatellite: !this.data.showSatellite,
    });
  },

  changeArea() {
    const area = this.data.area === "benbu" ? "jingyue" : "benbu";

    this.setData({ area, marker: this.state[area].marker });

    // 重新缩放校区
    this.context.includePoints(area === "benbu" ? benbuArea : jingyueArea);

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
    this.context.getCenterLocation({
      success: ({ latitude, longitude }) => {
        this.setData({
          map: {
            scale:
              this.data.map.scale +
              (event.currentTarget.dataset.action === "zoom-in" ? 1 : -1),
            latitude,
            longitude,
          },
        });
      },
    });
  },

  /** 移动到当前坐标 */
  moveToLocation() {
    this.context.moveToLocation();
  },

  /** 选择分类 */
  select({
    currentTarget,
  }: WechatMiniprogram.TouchEvent<
    Record<string, never>,
    Record<string, never>,
    { index: number }
  >) {
    const { index } = currentTarget.dataset;
    const { name, path } = this.data.category[index];
    const markers = this.state[this.data.area].marker[path];

    this.setData({
      currentCategory: path,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      "locationPopup.title": name,
    });
    this.context.includePoints({ padding: [30, 20, 30, 20], points: markers });
  },

  markerTap(event: WechatMiniprogram.MarkerTap) {
    const { area, currentCategory } = this.data;

    const item = this.data.marker[currentCategory].find(
      (item) => item.id === event.detail.markerId
    )!;

    if (event.type === "markertap") {
      if (item.path) this.$preload(`location?id=${area}/${item.path}`);
    } else if (event.type === "callouttap") {
      if (item.path) {
        const point = JSON.stringify({
          latitude: item.latitude,
          longitude: item.longitude,
          name: item.name,
        });

        this.$go(`location?id=${area}/${item.path}&point=${point}`);
      } else tip("该地点暂无详情");
    }
  },

  toggleLocationPopup() {
    this.setData({ showLocation: !this.data.showLocation });
  },

  toggleNavigatePopup() {
    this.setData({ showNavigate: !this.data.showNavigate });
  },

  navigate({ currentTarget }: WechatMiniprogram.TouchEvent) {
    const { name, latitude, longitude } = this.data.marker.all.find(
      (item) => item.id === Number(currentTarget.dataset.id)
    )!;

    this.context.openMapApp({
      latitude,
      longitude,
      destination: name,
    });
  },

  openLocation({ currentTarget }: WechatMiniprogram.TouchEvent) {
    const { area, currentCategory } = this.data;

    const { name, latitude, longitude, path } = this.data.marker[
      currentCategory
    ].find((item) => item.id === currentTarget.dataset.id)!;

    if (path) {
      const point = JSON.stringify({ latitude, longitude, name });

      this.$go(`location?id=${area}/${path}&point=${point}`);
    } else tip("该地点暂无详情");
  },

  regionChange(event: WechatMiniprogram.RegionChange) {
    if (event.causedBy === "gesture" && event.type === "begin")
      this.state.gestureHold = true;

    // 用户对地图进行了缩放或移动
    if (
      (event.causedBy === "scale" || event.causedBy === "drag") &&
      event.type === "end" &&
      this.state.gestureHold
    ) {
      this.context.getScale({
        success: ({ scale }) => {
          this.context.getCenterLocation({
            success: ({ latitude, longitude }) => {
              this.setData({
                map: { scale, latitude, longitude },
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
});
