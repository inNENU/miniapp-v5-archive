import { $Component } from "@mptool/enhance";

import { defaultScroller, pageScrollMixin } from "../../../mixins/page-scroll";

import type { AppOption } from "../../../app";

const { globalData } = getApp<AppOption>();

$Component({
  properties: {
    darkmode: Boolean,
    nav: Object,
  },

  data: {
    statusBarHeight: globalData.info.statusBarHeight,
    titleDisplay: false,
    borderDisplay: false,
    shadow: false,
    firstPage: false,
  },

  behaviors: [pageScrollMixin(defaultScroller)],

  methods: {
    back(): void {
      if (this.data.firstPage) this.$switch("main");
      else this.$back();
    },

    setTheme(theme: string): void {
      this.setData({ theme });
    },
  },

  lifetimes: {
    attached() {
      this.setData({
        theme: globalData.theme,
        firstPage: getCurrentPages().length === 1,
      });

      // bind this
      this.setTheme = this.setTheme.bind(this);
      this.$on("theme", this.setTheme);
    },

    detached() {
      this.$off("theme", this.setTheme);
    },
  },

  options: {
    styleIsolation: "shared",
  },
});
