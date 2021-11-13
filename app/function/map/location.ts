import { $Page } from "@mptool/enhance";
import { readJSON } from "@mptool/file";

import { defaultScroller } from "../../mixins/page-scroll";
import { getTitle, getImagePrefix } from "../../utils/config";
import { getJSON } from "../../utils/json";
import { resolvePage, setPage } from "../../utils/page";

import type { AppOption } from "../../app";
import type { MarkerConfig, PageData } from "../../../typings";

const { globalData } = getApp<AppOption>();

const referer = getTitle();

$Page("location", {
  data: {
    page: {} as PageData,
    marker: "",
  },

  state: { id: "", area: "", path: "" },

  onPreload(options) {
    const { area, path } = options;
    const id = `${area}/${path}`;

    resolvePage({ id }, readJSON(`function/map/${id}`));
  },

  onLoad(option) {
    const { area, path } = option;

    if (area && path) {
      const id = `${area}/${path}`;

      if (globalData.page.id === id) setPage({ option, ctx: this });
      else
        getJSON<PageData>(`function/map/${id}`)
          .then((data) => {
            setPage({ option, ctx: this }, data);
          })
          .catch(() => {
            setPage(
              { option, ctx: this },
              {
                error: true,
                statusBarHeight: globalData.info.statusBarHeight,
              }
            );
          });

      this.state.area = area;
      this.state.path = path;
      this.state.id = id;
    }

    this.setData({
      statusBarHeight: globalData.info.statusBarHeight,
      firstPage: getCurrentPages().length === 1,
      env: globalData.env,
    });
  },

  onReady() {
    this.setMarker();
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll(options) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.defaultScroller(options);
  },

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    return {
      title: this.data.page.title,
      path: `/function/map/location?id=${this.state.id}`,
    };
  },

  onShareTimeline(): WechatMiniprogram.Page.ICustomTimelineContent {
    return {
      title: this.data.page.title,
      query: `id=${this.state.id}`,
    };
  },

  onAddToFavorites(): WechatMiniprogram.Page.IAddToFavoritesContent {
    return {
      title: this.data.page.title,
      imageUrl: `${getImagePrefix()}.jpg`,
      query: `id=${this.state.id}`,
    };
  },

  defaultScroller,

  /** 设置标记点 */
  setMarker() {
    return getJSON<MarkerConfig>(`function/map/marker/${this.state.area}`).then(
      ({ marker }) => {
        const item = marker.all.find((item) => item.path === this.state.path);

        if (item)
          this.setData({
            marker: JSON.stringify({
              latitude: item.latitude,
              longitude: item.longitude,
              name: item.name,
            }),
          });
      }
    );
  },

  /** 开启导航 */
  navigate() {
    wx.navigateTo({
      url: `plugin://routePlan/index?key=NLVBZ-PGJRQ-T7K5F-GQ54N-GIXDH-FCBC4&referer=${referer}&endPoint=${this.data.marker}&mode=walking&themeColor=#2ecc71`,
    });
  },

  /** 返回按钮功能 */
  back() {
    if (getCurrentPages().length === 1) this.$switch("main");
    else this.$back();
  },
});
