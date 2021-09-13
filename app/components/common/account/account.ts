import { $Component } from "@mptool/enhance";
import { readFile } from "@mptool/file";

import { server } from "../../../utils/config";
import { modal, savePhoto, tip } from "../../../utils/wx";

import type { PropType } from "@mptool/enhance";
import type { AppOption } from "../../../app";
import type { AccountComponentOptions } from "../../../../typings";

type IconData = Record<string, string>;

const {
  globalData: { env },
} = getApp<AppOption>();

let store: { qq: string; wx: string } | null = null;

$Component({
  properties: {
    config: {
      type: Object as PropType<AccountComponentOptions>,
      required: true,
    },
  },

  data: {
    env,
  },

  methods: {
    /** QQ */
    qq(): void {
      const { qq, qrcode = "" } = this.data.config;

      if (qrcode)
        if (env === "qq")
          wx.previewImage({
            urls: [`${server}${qrcode}`],
          });
        else
          savePhoto(qrcode)
            .then(() => tip("二维码已存至相册"))
            .catch(() => tip("二维码保存失败"));
      else
        wx.setClipboardData({
          data: qq.toString(),
          success: () => {
            modal("复制成功", "由于暂无二维码，QQ号已复制至您的剪切板");
          },
        });
    },

    /** 微信 */
    wechat(): void {
      const { wx, path } = this.data.config;

      if (path) this.$go(`account-detail?path=${path}`);
      else
        savePhoto(`https://open.weixin.qq.com/qr/code?username=${wx}`)
          .then(() => tip("二维码已存至相册"))
          .catch(() => tip("二维码保存失败"));
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
