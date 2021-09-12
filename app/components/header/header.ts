import { $Component } from "@mptool/enhance";
import type { AppOption } from "../../app";

const { globalData } = getApp<AppOption>();

$Component({
  properties: {
    title: {
      type: String,
    },
  },
  lifetimes: {
    attached() {
      const query = this.createSelectorQuery();
      const { statusBarHeight } = globalData.info;

      this.setData({
        statusBarHeight,
        firstPage: getCurrentPages().length === 1,
      });

      query
        .select(".header")
        .boundingClientRect(({ height }) => {
          this.setData({ height });
        })
        .exec();
    },
  },
  methods: {
    back() {
      if (getCurrentPages().length === 1) this.$switch("main");
      else this.$back();
    },
  },

  externalClasses: ["header-class"],
});
