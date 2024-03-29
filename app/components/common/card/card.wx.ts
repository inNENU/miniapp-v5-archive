import { $Component } from "@mptool/enhance";
import { readFile } from "@mptool/file";

import { modal } from "../../../utils/api";

import type { PropType } from "@mptool/enhance";
import type { CardComponentOptions } from "../../../../typings";

$Component({
  properties: {
    config: {
      type: Object as PropType<CardComponentOptions>,
      required: true,
    },
  },

  methods: {
    /** 点击卡片触发的操作 */
    tap(): void {
      const { config } = this.data;

      if ("options" in config) wx.navigateToMiniProgram(config.options);
      else {
        // 页面路径
        if (!config.url.match(/^https?:\/\//)) this.$go(config.url);
        // 判断是否是可以跳转的微信图文
        else if (config.url.startsWith("https://mp.weixin.qq.com"))
          this.$go(`web?url=${config.url}&title=${config.title}`);
        // 无法跳转，复制链接到剪切板
        else
          wx.setClipboardData({
            data: config.url,
            success: () => {
              modal(
                "无法直接打开",
                "小程序无法直接打开网页，链接地址已复制至剪切板。请打开浏览器粘贴查看"
              );
            },
          });
      }
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
      this.$on("inited", this.setLogo);
    },

    detached() {
      this.$off("inited", this.setLogo);
    },
  },

  observers: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    "config.logo"(value: string): void {
      this.setLogo(value);
    },
  },
});
