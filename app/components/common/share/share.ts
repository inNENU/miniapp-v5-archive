import { readFile } from "../../../utils/file";
import { savePhoto } from "../../../utils/wx";

import type { AppOption } from "../../../app";
import type { PageData } from "../../../../typings";

const {
  globalData: { env, appID },
} = getApp<AppOption>();

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

type IconData = Record<string, string>;

const store: { iconData: IconData | null } = {
  iconData: null,
};

Component({
  properties: { config: { type: Object, value: { id: "" } } },

  methods: {
    /** 二维码下载 */
    download(): void {
      const { config } = this.data;

      if (typeof config.qrcode === "string")
        savePhoto(`/img/QRCode/${appID}/${config.qrcode}.png`);
      else savePhoto(`/img/QRCode/${appID}/${config.id as string}.png`);
    },
  },

  lifetimes: {
    attached(): void {
      if (!store.iconData)
        store.iconData = JSON.parse(
          (readFile("icon/shareicons") as string) || "{}"
        ) as IconData;

      this.setData({ iconData: store.iconData });
    },
  },

  observers: {
    config(config: PageData): void {
      const actions: ActionConfig[] = [];

      if (config.shareable) {
        if (env === "qq")
          actions.push(
            {
              icon: "qq",
              text: "分享给最近联系人",
              openType: "share",
              shareMode: ["recentContacts"],
            },
            {
              icon: "qq",
              text: "分享给好友",
              openType: "share",
              shareMode: ["qq"],
            },
            {
              icon: "qzone",
              text: "分享到空间",
              openType: "share",
              shareMode: ["qzone"],
            },
            {
              icon: "moments",
              text: "分享到朋友圈",
              openType: "share",
              shareMode: ["wechatMoment"],
            },
            {
              icon: "wechat",
              text: "分享给微信好友",
              openType: "share",
              shareMode: ["wechatFriends"],
            }
          );
        else
          actions.push({
            icon: "wechat",
            text: "分享给好友",
            openType: "share",
          });

        if (config.qrcode !== false)
          actions.push({
            icon: "qrcode",
            text: "下载二维码",
            action: "download",
          });
      }

      if (config.contact !== false)
        if (env === "qq")
          actions.push({
            icon: "contact",
            text: "联系 Mr.Hope",
            openType: "addFriend",
            openId: "868D7B2F0C609B4285698EAB77A47BA1",
          });
        else
          actions.push({
            icon: "contact",
            text: "联系 Mr.Hope",
            openType: "contact",
          });

      if (env === "wx" && config.feedback !== false)
        actions.push({
          icon: "feedback",
          text: "意见反馈",
          openType: "feedback",
        });

      this.setData({ actions });
    },
  },

  options: {
    styleIsolation: "apply-shared",
  },
});
