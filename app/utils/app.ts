/* eslint-disable max-lines */

/** 文件管理器与API封装 */
import { remove, listFile, saveFile, unzip } from "./file";
import { compareVersion, modal, netReport, requestJSON, tip } from "./wx";
import { error, info, warn } from "./log";
import { GlobalData } from "../app";
import { appOption, server } from "./config";

/**
 * 下载对应资源并将其解压
 *
 * @param list 需要下载的资源列表
 * @param callBack 下载完成的回调函数
 */
const resDownload = (list: string[], callBack: () => void): void => {
  const promise = list.map(
    (name) =>
      new Promise((resolve) => {
        // 下载zip包
        wx.downloadFile({
          url: `${server}resource/${name}.zip`,
          success: (res) => {
            console.info(`${name} statusCode is ${res.statusCode}`); // 调试
            if (res.statusCode === 200) {
              // 保存压缩文件到压缩目录
              saveFile(res.tempFilePath, `${name}Zip`);
              console.info(`save ${name} success`); // 调试

              // 解压文件到根目录
              unzip(`${name}Zip`, "", () => {
                console.info(`unzip ${name} sucess`); // 调试

                // 删除压缩目录，并将下载成功信息写入存储、判断取消提示
                remove(`${name}Zip`, "file");
                wx.setStorageSync(`${name}Download`, true);

                console.info(`delete ${name} sucess`); // 调试

                // 下载资源文件并写入更新时间
                const timeStamp = new Date().getTime();

                wx.setStorageSync(
                  `${name}UpdateTime`,
                  Math.round(timeStamp / 1000)
                );

                resolve();
              });
            }
          },

          // 下载失败
          fail: (failMsg) => {
            netReport();
            error(`初始化小程序时下载 ${name} 失败:`, failMsg);
          },
        });
      })
  );

  Promise.all(promise).then(() => callBack());
};

/** 初始化小程序 */
export const appInit = (): void => {
  // 提示用户正在初始化
  wx.showLoading({ title: "初始化中...", mask: true });
  info("初次启动");

  // 设置主题
  if (appOption.theme === "auto") {
    // 主题为auto
    let num;
    let theme;
    const { platform } = wx.getSystemInfoSync();

    // 根据平台设置主题
    switch (platform) {
      case "ios":
      case "windows":
        theme = "iOS";
        num = 0;
        break;
      case "android":
        theme = "Android";
        num = 1;
        break;
      default:
        theme = "iOS";
        num = 0;
    }

    wx.setStorageSync("theme", theme);
    wx.setStorageSync("themeNum", num);
  } else {
    wx.setStorageSync("theme", appOption.theme);
    wx.setStorageSync("themeNum", appOption.themeNum);
  }

  // 写入预设数据
  Object.keys(appOption).forEach((data) => {
    wx.setStorageSync(data, appOption[data]);
  });

  resDownload(["function", "guide", "intro"], () => {
    // 成功初始化
    wx.setStorageSync("app-inited", true);
    wx.hideLoading();
  });
};

/** 通知格式 */
export interface Notice {
  /** 标题 */
  title: string;
  /** 内容 */
  content: string;
  /** 是否每次都通知 */
  force?: boolean;
}

/**
 * 弹窗通知检查
 *
 * @param globalData 小程序的全局数据
 */
export const noticeCheck = (globalData: GlobalData): void => {
  requestJSON(
    `resource/config/${globalData.appID}/${globalData.version}/notice`,
    (noticeList: Record<string, Notice>) => {
      for (const pageName in noticeList) {
        const notice = noticeList[pageName];
        const oldNotice = wx.getStorageSync(`${pageName}-notice`);

        // 如果通知内容不同或为强制通知，写入通知信息，并重置通知状态
        if (
          oldNotice.title !== notice.title ||
          oldNotice.content !== notice.content ||
          notice.force
        ) {
          wx.setStorageSync(`${pageName}-notice`, notice);
          wx.removeStorageSync(`${pageName}-notifyed`);
        }

        // 如果找到APP级通知，进行判断
        if (pageName === "app")
          if (!wx.getStorageSync("app-notifyed") || notice.force)
            modal(notice.title, notice.content, () =>
              wx.setStorageSync("app-notifyed", true)
            );
      }
    },
    () => {
      // 调试信息
      warn("noticeList error", "Net Error");
    },
    () => {
      // 调试信息
      error("noticeList error", "Address Error");
    }
  );
};

/**
 * 根据用户设置，判断当前小程序是否应启用夜间模式
 *
 * @returns 夜间模式状态
 */
export const getDarkmode = (
  sysInfo?: WechatMiniprogram.GetSystemInfoSyncResult
): boolean => {
  if (sysInfo) return sysInfo.theme === "dark";

  return wx.getSystemInfoSync().theme === "dark";
};

interface UpdateInfo {
  /** 是否进行强制更新 */
  forceUpdate: boolean;
  /** 是否进行强制初始化 */
  reset: boolean;
}

/**
 * 检查小程序更新
 *
 * 如果检测到小程序更新，获取升级状态 (新版本号，是否立即更新、是否重置小程序) 并做相应处理
 *
 * @param globalData 小程序的全局数据
 */
export const appUpdate = (globalData: GlobalData): void => {
  const updateManager = wx.getUpdateManager();

  // 检查更新
  updateManager.onCheckForUpdate((status) => {
    // 找到更新，提示用户获取到更新
    if (status.hasUpdate) tip("发现小程序更新，下载中...");
  });

  updateManager.onUpdateReady(() => {
    // 请求配置文件
    requestJSON<string>(
      `resource/config/${globalData.appID}/version`,
      (version) => {
        // 请求配置文件
        requestJSON(
          `resource/config/${globalData.appID}/${version}/config`,
          (data) => {
            const { forceUpdate, reset } = data as UpdateInfo;

            // 更新下载就绪，提示用户重新启动
            wx.showModal({
              title: "已找到新版本",
              content: `新版本${version}已下载，请重启应用更新。${
                reset ? "该版本会初始化小程序。" : ""
              }`,
              showCancel: !reset && !forceUpdate,
              confirmText: "应用",
              cancelText: "取消",
              success: (res) => {
                // 用户确认，应用更新
                if (res.confirm) {
                  // 需要初始化
                  if (reset) {
                    // 显示提示
                    wx.showLoading({ title: "初始化中", mask: true });

                    // 清除文件系统文件与数据存储
                    listFile("").forEach((filePath) => {
                      remove(filePath);
                    });
                    wx.clearStorageSync();

                    // 隐藏提示
                    wx.hideLoading();
                  }

                  // 应用更新
                  updateManager.applyUpdate();
                }
              },
            });
          }
        );
      }
    );
  });

  // 更新下载失败
  updateManager.onUpdateFailed(() => {
    // 提示用户网络出现问题
    tip("小程序更新下载失败，请检查您的网络！");

    // 调试
    warn("Upate App error because of Net Error");
  });
};

/**
 * 登录
 *
 * @param appID 小程序的appID
 */
export const login = ({ appID, env }: GlobalData): void => {
  const openid = wx.getStorageSync("openid");

  if (openid) console.info(`openid为: ${openid}`);
  else
    wx.login({
      success: (res) => {
        if (res.code)
          wx.request({
            url: `${server}service/login.php`,
            method: "POST",
            data: { appID, code: res.code, env },
            enableHttp2: true,
            success: (res2) => {
              wx.setStorageSync("openid", (res2.data as any).openid);
              console.info(`openid 为: ${(res2.data as any).openid}`);
            },
          });
      },
      fail: (errMsg) => {
        console.error(`登录失败！${errMsg}`);
      },
    });
};

/**
 * 小程序启动时的运行函数
 *
 * 负责检查通知与小程序更新，注册网络、内存、截屏的监听
 *
 * @param globalData 小程序的全局数据
 */
// eslint-disable-next-line max-lines-per-function
export const startup = (globalData: GlobalData): void => {
  // 获取设备与运行环境信息
  globalData.info = wx.getSystemInfoSync();
  if (globalData.info.AppPlatform === "qq") globalData.env = "qq";

  // 获取主题、夜间模式、appID
  globalData.theme = wx.getStorageSync("theme");
  globalData.darkmode = getDarkmode(globalData.info);
  globalData.appID = wx.getAccountInfoSync().miniProgram.appId;

  // 检测基础库版本
  if (
    ((globalData.env === "qq" &&
      compareVersion(globalData.info.SDKVersion, "1.9.0") < 0) ||
      (globalData.env === "wx" &&
        compareVersion(globalData.info.SDKVersion, "2.8.0") < 0)) &&
    wx.getStorageSync("SDKVersion") !== globalData.info.SDKVersion
  )
    modal(
      "基础库版本偏低",
      `您的${
        globalData.env === "qq" ? "QQ" : "微信"
      }版本偏低，虽然不会影响小程序的功能，但会导致部分内容显示异常。为获得最佳体验，建议您更新至最新版本。`,
      () => {
        // 避免重复提示
        wx.setStorageSync("SDKVersion", globalData.info.SDKVersion);
        if (wx.canIUse("updateWeChatApp")) wx.updateWeChatApp();
      }
    );

  // 检查通知更新与小程序更新
  noticeCheck(globalData);
  appUpdate(globalData);

  // 设置内存不足警告
  wx.onMemoryWarning((res) => {
    tip("内存不足");
    console.warn("onMemoryWarningReceive");
    wx.reportAnalytics("memory_warning", {
      // eslint-disable-next-line
      memory_warning: res && res.level ? res.level : 0,
    });
  });

  // 获取网络信息
  wx.getNetworkType({
    success: (res) => {
      const { networkType } = res;

      if (networkType === "none" || networkType === "unknown")
        tip("您的网络状态不佳");
    },
  });

  // 监听网络状态
  wx.onNetworkStatusChange((res) => {
    // 显示提示
    if (!res.isConnected) {
      tip("网络连接中断,部分小程序功能暂不可用");
      wx.setStorageSync("networkError", true);
    } else if (wx.getStorageSync("network")) {
      wx.setStorageSync("networkError", false);
      tip("网络链接恢复");
    }
  });

  // 监听用户截屏
  if (wx.getStorageSync("capture-screen") !== "never")
    wx.onUserCaptureScreen(() => {
      const status = wx.getStorageSync("capture-screen");
      wx.showModal({
        title: "善用小程序分享",
        content:
          "您可以点击右上角选择分享到好友、分享到朋友圈/空间\n您也可以点击页面右下角的分享图标，选择保存二维码分享小程序",
        showCancel: status === "noticed",
        cancelText: "不再提示",
        success: (res) => {
          if (res.confirm) wx.setStorageSync("capture-screen", "noticed");
          else if (res.cancel) {
            wx.setStorageSync("capture-screen", "never");
            if (wx.canIUse("offUserCaptureScreen")) wx.offUserCaptureScreen();
          }
        },
      });
    });

  // 登录
  login(globalData);
};
