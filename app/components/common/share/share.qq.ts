import { $Component, logger } from "@mptool/enhance";

import { server, getTitle } from "../../../utils/config";
import { path2id } from "../../../utils/id";
import { modal, savePhoto, tip } from "../../../utils/wx";

import type { PropType } from "@mptool/enhance";
import type { AppOption } from "../../../app";
import type { PageData } from "../../../../typings";

const {
  globalData: { env, appID },
} = getApp<AppOption>();

type ShareConfig = Pick<
  PageData,
  "id" | "contact" | "qrcode" | "title" | "shareable"
>;

interface ActionConfig {
  icon: string;
  text: string;
  hidden?: boolean;
  openType?: string;
  openId?: string;
  groupId?: string;
  shareMode?: string[];
  action?: string;
}

type LinkData = { error: true } | { error: false; link: string };

$Component({
  properties: {
    config: {
      type: Object as PropType<ShareConfig>,
      default: { id: "" },
    },
  },

  methods: {
    /** 二维码下载 */
    download(): void {
      const { config } = this.data;

      savePhoto(
        `/qrcode/${appID}/${
          typeof config.qrcode === "string" ? config.qrcode : config.id!
        }.png`
      )
        .then(() => tip("二维码已存至相册"))
        .catch(() => tip("二维码保存失败"));
    },

    copyQQLink() {
      this.copy(
        `https://m.q.qq.com/a/p/${appID}?s=${encodeURI(
          `module/page?path=${path2id(this.data.config.id)}`
        )}`
      );
    },

    wechatMomentShare() {
      this.hint("转发到朋友圈");
    },

    wechatStar() {
      this.hint("收藏");
    },

    hint(msg: string) {
      modal(
        "功能受限",
        `受到微信客户端限制，请您点击右上角菜单(···)以${msg}。`
      );
    },

    copyWechatLink() {
      wx.request<LinkData>({
        url: `${server}service/share-link.php`,
        enableHttp2: true,
        method: "POST",
        data: { appID, id: this.data.config.id! },
        success: ({ data, statusCode }) => {
          if (statusCode === 200 && !data.error) this.copy(data.link);
          else modal("链接尚未生成", "请使用小程序右上角菜单(···)来复制链接。");
        },
      });
    },

    copy(link: string) {
      const { title } = this.data.config;
      const content = `${title ? `${getTitle()}查看『${title}』:` : ""}${link}`;

      wx.setClipboardData({
        data: content,
        success: () => {
          tip("链接已复制");
          logger.debug(`Share content is copied: ${content}`);
        },
      });
    },
  },

  observers: {
    config(config: ShareConfig): void {
      const actions: ActionConfig[] = [];

      if (config.shareable) {
        if (env === "qq")
          actions.push(
            {
              icon: "./icon/recent",
              text: "分享给最近联系人",
              openType: "share",
              shareMode: ["recentContacts"],
            },
            {
              icon: "/icon/qq",
              text: "分享给好友",
              openType: "share",
              shareMode: ["qq"],
            },
            {
              icon: "./icon/qzone",
              text: "分享到空间",
              openType: "share",
              shareMode: ["qzone"],
            },
            {
              icon: "./icon/link",
              text: "复制链接",
              action: "copyQQLink",
            },
            {
              icon: "./icon/star",
              text: "收藏",
              openType: "addToFavorites",
            },
            {
              icon: "/icon/wechat",
              text: "分享给微信好友",
              openType: "share",
              shareMode: ["wechatFriends"],
            },
            {
              icon: "./icon/moments",
              text: "分享到朋友圈",
              openType: "share",
              shareMode: ["wechatMoment"],
            }
          );
        else
          actions.push(
            {
              icon: "/icon/wechat",
              text: "分享给好友",
              openType: "share",
            },
            {
              icon: "./icon/moments",
              text: "分享到朋友圈",
              action: "wechatMomentShare",
            },
            {
              icon: "./icon/link",
              text: "复制链接",
              action: "copyWechatLink",
            },
            {
              icon: "./icon/star",
              text: "收藏",
              action: "wechatStar",
            }
          );

        if (config.qrcode !== false)
          actions.push({
            icon: "./icon/qrcode",
            text: "下载二维码",
            action: "download",
          });
      }

      if (config.contact !== false)
        actions.push({
          icon: "./icon/contact",
          text: "联系 Mr.Hope",
          openType: env === "qq" ? "addFriend" : "contact",
          openId: env === "qq" ? "868D7B2F0C609B4285698EAB77A47BA1" : "",
        });

      this.setData({ actions });
    },
  },

  options: {
    styleIsolation: "apply-shared",
  },
});
