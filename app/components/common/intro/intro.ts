import { $Component } from "@mptool/enhance";
import { readFile } from "@mptool/file";

import { modal, savePhoto, tip } from "../../../utils/wx";

import type { PropType } from "@mptool/enhance";
import type { AppOption } from "../../../app";
import type { IntroComponentOptions } from "../../../../typings";

type IconData = Record<string, string>;

const {
  globalData: { env },
} = getApp<AppOption>();

let store: { qq: string; wx: string } | null = null;

$Component({
  properties: {
    /** 介绍组件配置 */
    config: {
      type: Object as PropType<IntroComponentOptions>,
      required: true,
    },
  },

  data: { env },

  methods: {
    /** QQ */
    qq(): void {
      const { qq, qqQRCode = "" } = this.data.config;

      if (qqQRCode)
        if (env === "qq")
          wx.previewImage({
            urls: [qqQRCode],
          });
        else
          savePhoto(qqQRCode)
            .then(() => tip("二维码已存至相册"))
            .catch(() => tip("二维码保存失败"));
      else if (qq)
        wx.setClipboardData({
          data: qq.toString(),
          success: () => {
            modal("复制成功", "由于暂无二维码，QQ号已复制至您的剪切板");
          },
        });
    },

    /** 微信 */
    wechat(): void {
      const { path, wx: wechat, wxQRCode } = this.data.config;

      if (path) this.$go(`account-detail?path=${path}`);
      else if (wxQRCode)
        savePhoto(wxQRCode)
          .then(() => tip("二维码已存至相册"))
          .catch(() => tip("二维码保存失败"));
      else if (wechat)
        wx.previewImage({
          urls: [`https://open.weixin.qq.com/qr/code?username=${wechat}`],
        });
    },

    setIconData() {
      if (!store) {
        const data = JSON.parse(
          (readFile("icon/shareicons") as string) || "null"
        ) as IconData;

        store = {
          wx: data.wechat,
          qq: data.qq,
        };
      }
    },
  },

  lifetimes: {
    attached() {
      this.setIconData();
      this.setData({ icon: store });
    },
  },
});
