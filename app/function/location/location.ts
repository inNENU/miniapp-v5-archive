import { $Page } from "@mptool/enhance";
import { readJSON } from "@mptool/file";

import { defaultScroller } from "../../mixins/page-scroll";
import { getTitle, getImagePrefix } from "../../utils/config";
import { getJSON } from "../../utils/json";
import { resolvePage, setPage } from "../../utils/page";

import type { AppOption } from "../../app";
import type { PageData } from "../../../typings";

const { globalData } = getApp<AppOption>();

const referer = getTitle();

$Page("location", {
  data: {
    page: {} as PageData,
    marker: "",
  },

  state: { id: "" },

  onPreload(options) {
    const { id } = options;

    resolvePage({ id }, readJSON(`function/map/${id}`));
  },

  onLoad(option) {
    const { id, marker = "" } = option;

    if (id) {
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

      this.state.id = id;
    }

    this.setData({
      statusBarHeight: globalData.info.statusBarHeight,
      firstPage: getCurrentPages().length === 1,
      env: globalData.env,
      marker,
    });
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll(options) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.defaultScroller(options);
  },

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    const { page, marker } = this.data;

    return {
      title: page.title,
      path: `/function/map/location?id=${this.state.id}${
        marker ? `&marker=${marker}` : ""
      }`,
    };
  },

  onShareTimeline(): WechatMiniprogram.Page.ICustomTimelineContent {
    const { page, marker } = this.data;

    return {
      title: page.title,
      query: `id=${this.state.id}${marker ? `&marker=${marker}` : ""}`,
    };
  },

  onAddToFavorites(): WechatMiniprogram.Page.IAddToFavoritesContent {
    const { page, marker } = this.data;

    return {
      title: page.title,
      imageUrl: `${getImagePrefix()}.jpg`,
      query: `id=${this.state.id}${marker ? `&marker=${marker}` : ""}`,
    };
  },

  defaultScroller,

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
