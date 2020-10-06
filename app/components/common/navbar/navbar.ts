/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import $register = require("wxpage");
import { AppOption } from "../../../app";
import { pageScrollMixin } from "../../mixins/page-scroll";
const { globalData } = getApp<AppOption>();

$register.C({
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
    pageScrollMixin(function (option): void {
      // 判断情况并赋值
      const nav = {
        borderDisplay: option.scrollTop >= 53,
        titleDisplay: option.scrollTop > 42,
        shadow: option.scrollTop > 1,
      };

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const that = this as {
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
      };
      // 判断结果并更新界面数据
      if (that.data.titleDisplay !== nav.titleDisplay)
        that.setData({
          titleDisplay: nav.titleDisplay,
        });
      else if (that.data.borderDisplay !== nav.borderDisplay)
        that.setData({
          borderDisplay: nav.borderDisplay,
        });
      else if (that.data.shadow !== nav.shadow)
        that.setData({ shadow: nav.shadow });
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

  options: {
    styleIsolation: "shared",
  },
});
