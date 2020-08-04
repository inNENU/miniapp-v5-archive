import $register = require("wxpage");
import { debug, warn } from "../../../utils/log";
import { downLoad, modal, tip } from "../../../utils/wx";
import { AppOption } from "../../../app";
const {
  globalData: { env, appID },
} = getApp<AppOption>(); // 获得日志管理器，全局数据

const savePhoto = (path: string): void => {
  wx.saveImageToPhotosAlbum({
    filePath: path,
    success: () => {
      tip("二维码已保存至相册");

      // 调试
      debug("二维码保存成功");
      wx.reportMonitor("8", 1);
    },
    fail: (msg) => {
      tip("二维码保存失败");

      // 调试
      warn("二维码保存失败", msg);
      wx.reportMonitor("6", 1);
    },
  });
};

$register.C({
  properties: { config: { type: Object, value: { id: "" } } as any },
  data: {
    // 小程序运行环境
    env,
  },
  methods: {
    /** QQ暂不支持联系客服的兼容 */
    contact(): void {
      if (env === "qq")
        wx.setClipboardData({
          data: "1178522294",
          success: () =>
            modal(
              "暂不支持",
              "QQ小程序暂不支持联系客服，请添加QQ1178522294。QQ号已经添加至您的剪切板。"
            ),
        });
    },

    /** 二维码下载 */
    download(): void {
      downLoad(
        `/img/QRCode/${appID}/${this.data.config.id}.png`,
        (path) => {
          wx.getSetting({
            // 获取用户设置
            success: (res2) => {
              // 如果已经授权相册直接写入图片
              if (res2.authSetting["scope.writePhotosAlbum"]) savePhoto(path);
              // 没有授权——>提示用户授权
              else
                wx.authorize({
                  scope: "scope.writePhotosAlbum",
                  success: () => {
                    // 获得授权，写入图片
                    savePhoto(path);
                  },

                  // 用户拒绝权限，提示用户开启权限
                  fail: () => {
                    modal(
                      "权限被拒",
                      "您拒绝了相册写入权限，如果想要保存图片，请在小程序设置页允许权限",
                      () => {
                        tip("二维码保存失败");
                        warn("用户拒绝相册授权"); // 调试
                      }
                    );
                  },
                });
            },
          });
        },
        () => {
          tip("二维码下载失败");

          // 调试
          warn(`下载 ${this.data.config.id} 二维码失败`);
          wx.reportMonitor("6", 1);
        },
        (statusCode) => {
          tip("二维码下载失败，服务器出错");

          // 调试
          warn(`${this.data.config.id} 二维码状态码异常: ${statusCode}`);
          wx.reportMonitor("7", 1);
        }
      );
    },
  },
});
