import { $Component } from "@mptool/enhance";
import { readFile } from "@mptool/file";

import { modal } from "../../../utils/wx";

import type { PropType } from "@mptool/enhance";
import type { AppOption } from "../../../app";
import type { CardComponentConfig } from "../../../../typings";

const {
  globalData: { appID },
} = getApp<AppOption>();

$Component({
  properties: {
    config: {
      type: Object as PropType<CardComponentConfig>,
      required: true,
    },
  },

  methods: {
    /** 点击卡片触发的操作 */
    tap(): void {
      const { config } = this.data;

      if (config.type === "web")
        if (appID === "wx9ce37d9662499df3")
          // 为企业主体微信小程序
          this.$go(`/module/web?url=${config.url}&title=${config.title}`);
        // 判断是否是可以跳转的微信图文
        else if (
          appID === "wx33acb831ee1831a5" &&
          (config.url.startsWith("https://mp.weixin.qq.com") ||
            config.url.startsWith("http://mp.weixin.qq.com"))
        )
          this.$go(`/module/web?url=${config.url}&title=${config.title}`);
        // 无法跳转，复制链接到剪切板
        else
          wx.setClipboardData({
            data: config.url,
            success: () => {
              modal(
                "无法跳转",
                "该小程序无法跳转网页，链接地址已复制至剪切板。请打开浏览器粘贴查看"
              );
            },
          });
      else if (config.type === "page") this.$go(config.url);
    },

    setLogo(value?: string) {
      const logo = value || this.data.config.logo;

      // 设置图标
      if (logo && !logo.includes("/"))
        this.setData({
          base64Logo: readFile(`icon/${logo}`) || "",
        });
    },
  },

  lifetimes: {
    attached() {
      this.setLogo = this.setLogo.bind(this);
      this.$emitter.on("inited", this.setLogo);
    },
    detached() {
      this.$emitter.off("inited", this.setLogo);
    },
  },

  observers: {
    "config.logo"(value: string): void {
      this.setLogo(value);
    },
  },
});
