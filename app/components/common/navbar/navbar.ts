import { $Component } from "@mptool/enhance";

import { pageScrollMixin } from "../../mixins/page-scroll";

import type { AppOption } from "../../../app";

const { globalData } = getApp<AppOption>();

$Component({
  properties: {
    theme: String,
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

  behaviors: [
    pageScrollMixin(function (
      this: {
        data: {
          titleDisplay: boolean;
          borderDisplay: boolean;
          shadow: boolean;
        };
        setData(
          data: Partial<{
            titleDisplay: boolean;
            borderDisplay: boolean;
            shadow: boolean;
          }>
        ): void;
      },
      option
    ): void {
      // 判断情况并赋值
      const nav = {
        borderDisplay: option.scrollTop >= 53,
        titleDisplay: option.scrollTop > 42,
        shadow: option.scrollTop > 1,
      };

      // 判断结果并更新界面数据
      if (
        this.data.titleDisplay !== nav.titleDisplay ||
        this.data.borderDisplay !== nav.borderDisplay ||
        this.data.shadow !== nav.shadow
      )
        this.setData(nav);
    }),
  ],

  methods: {
    back(): void {
      if (this.data.firstPage) this.$switch("main");
      else this.$back();
    },
  },

  lifetimes: {
    attached(): void {
      if (getCurrentPages().length === 1) this.setData({ firstPage: true });
    },
  },
});
