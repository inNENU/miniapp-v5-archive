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
      const { statusBarHeight } = globalData.info;

      this.setData({
        statusBarHeight,
        firstPage: getCurrentPages().length === 1,
      });

      this.createSelectorQuery()
        .in(this)
        .select(".header")
        .boundingClientRect((res) => {
          this.setData({
            // issues in QQ where the selector not working
            height: res?.height || statusBarHeight + 60,
          });
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
