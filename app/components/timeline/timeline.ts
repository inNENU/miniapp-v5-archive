export interface TimeLineItem {
  /** 时间线项目标题 */
  title: string;
  /** 时间线项目文字 */
  text: string;
  /** 时间线项目图标地址 */
  icon?: string;
  /** 时间线指示点颜色 */
  color: "green" | "red" | "blue";
  /** 跳转详情的名称 */
  path?: string;
  /** class 名称 */
  class?: string;
}

Component({
  properties: {
    /** 时间线配置 */
    config: Array,
  },

  data: {
    /** 是否使用交错布局 */
    alternate: false,
    timeList: [] as TimeLineItem[],
  },

  lifetimes: {
    attached() {
      wx.onWindowResize(this.updateTimeline);
      this.updateTimeline();
    },

    detached() {
      wx.offWindowResize(this.updateTimeline);
    },
  },

  methods: {
    active({ currentTarget }: WechatMiniprogram.TouchEvent): void {
      const { path } = (this.data.config as TimeLineItem[])[
        currentTarget.dataset.index as number
      ];

      if (path) this.triggerEvent("active", { path });
    },

    /** 更新时间线视图 */
    updateTimeline(): void {
      const res = wx.getSystemInfoSync();

      this.setData({ alternate: res.windowWidth >= 750 });
    },
  },
});
