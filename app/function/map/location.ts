import $register = require("wxpage");
import { changeNav, resolvePage, setPage } from "../../utils/page";
import { getJSON, readJSON } from "../../utils/file";
import { AppOption } from "../../app";
import { PageData } from "../../../typings";
const { globalData } = getApp<AppOption>();

$register("location", {
  data: {
    page: {} as PageData,
  },

  state: {
    id: "",
  },

  onPreload(res) {
    resolvePage(res, readJSON(`function/map/${res.query.id}`));
  },

  onLoad(option) {
    if (option.id) {
      if (globalData.page.id === option.id) setPage({ option, ctx: this });
      else
        getJSON({
          path: `function/map/${option.id}`,
          url: `resource/function/${option.id}`,
          success: (data) => {
            setPage({ option, ctx: this }, data as PageData);
          },
          fail: () => {
            setPage(
              { option, ctx: this },
              {
                error: true,
                statusBarHeight: globalData.info.statusBarHeight,
              }
            );
          },
        });

      this.state.id = option.id;
    }

    this.setData({ firstPage: getCurrentPages().length === 1 });

    if (wx.canIUse("onThemeChange")) wx.onThemeChange(this.themeChange);
  },

  /*
   * OnReady() {
   *   This.marker = wx.getStorageSync(`${this.xiaoqu}-all`)[this.id];
   * },
   */

  /*
   * Detail() {
   *   let markers = this.marker;
   *   wx.openLocation({
   *     latitude: marker.latitude,
   *     longitude: markers.longitude,
   *     name: markers.title,
   *   });
   * },
   */
  onPageScroll(event) {
    changeNav(event, this);
  },

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    return {
      title: this.data.page.title,
      path: `/function/map/location?from=主页&id=${this.state.id}`,
    };
  },

  onShareTimeline(): WechatMiniprogram.Page.ICustomTimelineContent {
    return {
      title: this.data.page.title,
      query: `from=主页&id${this.state.id}`,
    };
  },

  onAddToFavorites(): WechatMiniprogram.Page.IAddToFavoritesContent {
    return {
      title: this.data.page.title,
      query: `from=主页&id${this.state.id}`,
    };
  },

  onUnload() {
    if (wx.canIUse("onThemeChange")) wx.offThemeChange(this.themeChange);
  },

  themeChange({ theme }: WechatMiniprogram.OnThemeChangeCallbackResult) {
    this.setData({ darkmode: theme === "dark" });
  },

  /** 返回按钮功能 */
  back() {
    if (getCurrentPages().length === 1) this.$switch("main");
    else this.$back();
  },
});
