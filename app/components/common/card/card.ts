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

  lifetimes: {
    attached() {
      this.$emitter.on("inited", () => {
        this.setLogo(this.data.config.logo);
      });
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

    setLogo(logo?: string) {
      // 设置图标
      if (logo && !logo.includes("/"))
        this.setData({
          base64Logo: readFile(`icon/${logo}`) || "",
        });
    },
  },

  observers: {
    "config.logo"(value: string): void {
      this.setLogo(value);
    },
  },
});
