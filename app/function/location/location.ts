import { $Page } from "@mptool/enhance";
import { readJSON } from "@mptool/file";

import { defaultScroller } from "../../mixins/page-scroll";
import { getImagePrefix } from "../../utils/config";
import { getJSON } from "../../utils/json";
import { resolvePage, setPage } from "../../utils/page";

import type { AppOption } from "../../app";
import type { PageData } from "../../../typings";

const { globalData } = getApp<AppOption>();

$Page("location", {
  data: {
    page: <PageData>{},
  },

  state: { id: "" },

  onPreload(options) {
    const { id } = options;

    resolvePage({ id }, readJSON(`function/map/${id}`));
  },

  onLoad(option) {
    const { id } = option;

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
    });
  },

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onPageScroll(options) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.defaultScroller(options);
  },

  onShareAppMessage(): WechatMiniprogram.Page.ICustomShareContent {
    const { page } = this.data;

    return {
      title: page.title,
      path: `/function/map/location?id=${this.state.id}`,
    };
  },

  onShareTimeline(): WechatMiniprogram.Page.ICustomTimelineContent {
    const { page } = this.data;

    return {
      title: page.title,
      query: `id=${this.state.id}`,
    };
  },

  onAddToFavorites(): WechatMiniprogram.Page.IAddToFavoritesContent {
    const { page } = this.data;

    return {
      title: page.title,
      imageUrl: `${getImagePrefix()}.jpg`,
      query: `id=${this.state.id}`,
    };
  },

  defaultScroller,

  /** 返回按钮功能 */
  back() {
    if (getCurrentPages().length === 1) this.$switch("main");
    else this.$back();
  },
});
