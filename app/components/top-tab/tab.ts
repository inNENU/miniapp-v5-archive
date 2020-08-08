import { AppOption } from "../../app";
const { globalData } = getApp<AppOption>();
let currentSwipe: number;

Component({
  properties: {
    navList: {
      type: Array,
      value: [],
    },
    /** 是否立即更改还是等动画完成之后再进行更改 */
    immediate: {
      type: Boolean,
      value: true,
    },
    height: {
      type: Number,
      default: 200,
    },
  },

  data: {
    curNavItem: [],
    barleft: 0,
    current: 0,
  },

  methods: {
    changeTab({ currentTarget }: WXEvent.Touch): void {
      this.setData({ current: Number(currentTarget.dataset.index) });
    },
    change({ detail: { current } }: any): void {
      if (this.properties.immediate) this.setData({ current });
    },

    // 设置指示条动画
    transition({ detail }): void {
      this.setData({
        barleft:
          (detail.dx + globalData.info.screenWidth * currentSwipe) /
          this.data.navList.length,
      });
    },

    aminationFinish({ detail: { current } }: any): void {
      currentSwipe = current;
      if (!this.data.immediate) this.setData({ current });
    },
  },

  observers: {
    current(index): void {
      this.setData({ activeTab: index === 0 ? 0 : index - 1 });
    },
  },

  options: {
    multipleSlots: true,
  },
});
