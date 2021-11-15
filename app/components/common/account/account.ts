import { $Component } from "@mptool/enhance";

import { navigation } from "../../../utils/location";
import { modal, savePhoto, tip } from "../../../utils/wx";

import type { PropType } from "@mptool/enhance";
import type { AppOption } from "../../../app";
import type { AccountComponentOptions } from "../../../../typings";

const {
  globalData: { env },
} = getApp<AppOption>();

$Component({
  properties: {
    /** 介绍组件配置 */
    config: {
      type: Object as PropType<AccountComponentOptions>,
      required: true,
    },
  },

  data: { env },

  methods: {
    /** QQ */
    qq(): void {
      const { qq, qqcode = "" } = this.data.config;

      if (qqcode)
        if (env === "qq")
          wx.previewImage({
            urls: [qqcode],
          });
        else
          savePhoto(qqcode)
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
      const { account, wxid, wxcode } = this.data.config;

      if (account) this.$go(`account-detail?path=${account}`);
      else if (wxcode)
        savePhoto(wxcode)
          .then(() => tip("二维码已存至相册"))
          .catch(() => tip("二维码保存失败"));
      else if (wxid)
        wx.previewImage({
          urls: [`https://open.weixin.qq.com/qr/code?username=${wxid}`],
        });
    },

    link(): void {
      const { link } = this.data.config;

      wx.setClipboardData({
        data: link as string,
        success: () => tip("网址已复制"),
      });
    },

    navigate(): void {
      const { location, name } = this.data.config;

      navigation(JSON.stringify({ name, ...location }));
    },
  },
});
