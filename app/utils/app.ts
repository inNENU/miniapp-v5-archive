/* eslint-disable max-lines */
import { emitter, logger } from "@mptool/enhance";
import { ls, rm, writeJSON } from "@mptool/file";

import { getDarkmode, modal, requestJSON, tip } from "./api";
import { appConfig, server, version } from "./config";
import { downloadResource } from "./resource";

import type { PageData, VersionInfo } from "../../typings";

export type AppID = "wx33acb831ee1831a5" | "wx9ce37d9662499df3" | 1109559721;

export interface GlobalData {
  /** 小程序运行环境 */
  env: string;
  /** 版本号 */
  version: string;
  /** 播放器信息 */
  music: {
    /** 是否正在播放 */
    playing: boolean;
    /** 播放歌曲序号 */
    index: number;
  };
  /** 页面信息 */
  page: {
    /** 页面数据 */
    data?: PageData;
    /** 页面标识符 */
    id?: string;
  };
  /** 启动时间 */
  date: number;
  /** 正在应用的主题 */
  theme: string;
  /** 夜间模式开启状态 */
  darkmode: boolean;
  /** 设备信息 */
  info: WechatMiniprogram.SystemInfo;
  /** 小程序appid */
  appID: AppID;
  /** 用户 OPENID */
  openid: string;
  /** 是否能复制 */
  selectable: boolean;
}

/** 初始化小程序 */
export const initializeApp = (): void => {
  // 提示用户正在初始化
  wx.showLoading({ title: "初始化中...", mask: true });
  logger.info("First launch");

  // 设置主题
  if (appConfig.theme === "auto") {
    // 主题为 auto
    let num;
    let theme;
    const { platform } = wx.getSystemInfoSync();

    // 根据平台设置主题
    switch (platform) {
      case "android":
        theme = "android";
        num = 1;
        break;
      case "ios":
      case "windows":
      default:
        theme = "ios";
        num = 0;
    }

    wx.setStorageSync("theme", theme);
    wx.setStorageSync("themeNum", num);
  } else {
    wx.setStorageSync("theme", appConfig.theme);
    wx.setStorageSync("themeNum", appConfig.themeNum);
  }

  // 写入预设数据
  Object.keys(appConfig).forEach((data) => {
    wx.setStorageSync(data, appConfig[data]);
  });

  downloadResource("function-guide-icon-intro", false).then(() => {
    // 下载资源文件并写入更新时间
    const timeStamp = new Date().getTime();

    wx.setStorageSync("resourceUpdateTime", Math.round(timeStamp / 1000));

    wx.request<VersionInfo>({
      url: `${server}service/resource.php`,
      enableHttp2: true,
      success: ({ statusCode, data }) => {
        console.log("Version info", data);
        if (statusCode === 200) {
          writeJSON("version", data.version);
          // 成功初始化
          wx.setStorageSync("app-inited", true);
          emitter.emit("inited");
          wx.hideLoading();
        }
      },
    });
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
export const updateNotice = (globalData: GlobalData): void => {
  requestJSON<Record<string, Notice>>(
    `r/config/${globalData.appID}/${globalData.version}/notice`
  )
    .then((noticeList) => {
      for (const pageName in noticeList) {
        const notice = noticeList[pageName];
        const oldNotice = wx.getStorageSync<Notice | undefined>(
          `${pageName}-notice`
        );

        // 如果通知内容不同或为强制通知，写入通知信息，并重置通知状态
        if (
          !oldNotice ||
          oldNotice.title !== notice.title ||
          oldNotice.content !== notice.content ||
          notice.force
        ) {
          wx.setStorageSync(`${pageName}-notice`, notice);
          wx.removeStorageSync(`${pageName}-notifyed`);
        }

        // 如果找到 APP 级通知，进行判断
        if (pageName === "app")
          if (!wx.getStorageSync("app-notifyed") || notice.force)
            modal(notice.title, notice.content, () =>
              wx.setStorageSync("app-notifyed", true)
            );
      }
    })
    .catch(() => {
      // 调试信息
      logger.warn(`noticeList error`);
    });
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
export const updateApp = (globalData: GlobalData): void => {
  const updateManager = wx.getUpdateManager?.();

  if (updateManager) {
    // 检查更新
    updateManager.onCheckForUpdate(({ hasUpdate }) => {
      // 找到更新，提示用户获取到更新
      if (hasUpdate) tip("发现小程序更新，下载中...");
    });

    updateManager.onUpdateReady(() => {
      // 请求配置文件
      requestJSON<string>(`r/config/${globalData.appID}/version`)
        .then((version) =>
          // 请求配置文件
          requestJSON<UpdateInfo>(
            `r/config/${globalData.appID}/${version}/config`
          )
            .then(({ forceUpdate, reset }) => {
              // 更新下载就绪，提示用户重新启动
              wx.showModal({
                title: "已找到新版本",
                content: `新版本${version}已下载，请重启应用更新。${
                  reset ? "该版本会初始化小程序。" : ""
                }`,
                showCancel: !reset && !forceUpdate,
                confirmText: "应用",
                cancelText: "取消",
                success: ({ confirm }) => {
                  // 用户确认，应用更新
                  if (confirm) {
                    // 需要初始化
                    if (reset) {
                      // 显示提示
                      wx.showLoading({ title: "初始化中", mask: true });

                      // 清除文件系统文件与数据存储
                      ls("").forEach((filePath) => rm(filePath));
                      wx.clearStorageSync();

                      // 隐藏提示
                      wx.hideLoading();
                    }

                    // 应用更新
                    updateManager.applyUpdate();
                  }
                },
              });
            })
            .catch(() => {
              // 调试信息
              logger.warn(`config file error`);
            })
        )
        .catch(() => {
          // 调试信息
          logger.warn(`version file error`);
        });
    });

    // 更新下载失败
    updateManager.onUpdateFailed(() => {
      // 提示用户网络出现问题
      tip("小程序更新下载失败，请检查您的网络!");

      // 调试
      logger.warn("Upate App error because of Net Error");
    });
  }
};

interface LoginCallback {
  openid: string;
}

/**
 * 登录
 *
 * @param appID 小程序的appID
 */
const login = (
  appID: AppID,
  env: string,
  callback: (openid: string) => void
): void => {
  const openid = wx.getStorageSync<string | undefined>("openid");

  if (openid) {
    console.info(`User OPENID: ${openid}`);
    callback(openid);
  } else
    wx.login({
      success: ({ code }) => {
        if (code)
          wx.request<LoginCallback>({
            url: `${server}service/login.php`,
            method: "POST",
            data: { appID, code, env },
            enableHttp2: true,
            success: ({ data }) => {
              wx.setStorageSync("openid", data.openid);
              console.info(`User OPENID: ${data.openid}`);
              callback(data.openid);
            },
          });
      },
      fail: ({ errMsg }) => {
        console.error(`Login failed: ${errMsg}`);
      },
    });
};

/** 注册全局监听 */
const registerActions = (): void => {
  // 设置内存不足警告
  wx.onMemoryWarning((res) => {
    // tip("内存不足");
    console.warn("Memory warning received.");
    wx.reportAnalytics("memory_warning", {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      memory_warning: res && res.level ? res.level : 0,
    });
  });

  // 监听网络状态
  wx.onNetworkStatusChange(({ isConnected }) => {
    // 显示提示
    if (!isConnected) {
      tip("网络连接中断,部分小程序功能暂不可用");
      wx.setStorageSync("networkError", true);
    } else if (wx.getStorageSync("network")) {
      wx.setStorageSync("networkError", false);
      tip("网络链接恢复");
    }
  });

  if (
    wx.canIUse("onUserCaptureScreen") &&
    wx.getStorageSync("capture-screen") !== "never"
  ) {
    // 监听用户截屏
    // avoid issues on QQ
    let pending = false;

    wx.onUserCaptureScreen(() => {
      const status = wx.getStorageSync<"never" | "noticed" | undefined>(
        "capture-screen"
      );

      if (status !== "never" && !pending) {
        pending = true;
        wx.showModal({
          title: "善用小程序分享",
          content:
            "您可以点击右上角选择分享到好友、分享到朋友圈/空间\n您也可以点击页面右下角的分享图标，选择保存二维码分享小程序",
          showCancel: status === "noticed",
          cancelText: "不再提示",
          success: ({ cancel, confirm }) => {
            if (confirm) wx.setStorageSync("capture-screen", "noticed");
            else if (cancel) {
              wx.setStorageSync("capture-screen", "never");
              if (wx.canIUse("offUserCaptureScreen")) wx.offUserCaptureScreen();
            }

            pending = false;
          },
        });
      }
    });
  }
};

const checkGroupApp = (): void => {
  const { entryDataHash } = wx.getLaunchOptionsSync();

  if (entryDataHash)
    wx.getGroupInfo({
      entryDataHash,
      success: ({ isGroupManager }) => {
        if (isGroupManager)
          wx.getGroupAppStatus({
            entryDataHash,
            success: ({ isExisted }) => {
              if (!isExisted) {
                modal("尊敬的管理员", "请考虑添加小程序到群应用!", () => {
                  wx.navigateTo({
                    url: "/pages/action/action?action=addGroupApp",
                  });
                });
              }
            },
          });
      },
    });
};

export const getGlobalData = (): GlobalData => {
  // 获取设备与运行环境信息
  const info = wx.getSystemInfoSync();

  return {
    version,
    music: { playing: false, index: 0 },
    page: {
      data: {},
      id: "",
    },
    date: new Date().getTime(),
    env: info.AppPlatform || "wx",
    theme: "ios",
    info,
    darkmode: getDarkmode(info),
    appID: wx.getAccountInfoSync().miniProgram.appId as AppID,
    openid: "",
    selectable: wx.getStorageSync<boolean>("selectable") || false,
  };
};

/**
 * 小程序启动时的运行函数
 *
 * 负责检查通知与小程序更新，注册网络、内存、截屏的监听
 *
 * @param globalData 小程序的全局数据
 */
export const startup = (globalData: GlobalData): void => {
  // 获取主题、夜间模式、appID
  globalData.theme = wx.getStorageSync<string>("theme");

  // 获取网络信息
  wx.getNetworkType({
    success: ({ networkType }) => {
      if (networkType === "none") tip("您的网络状态不佳");
    },
  });

  if (wx.canIUse("onThemeChange"))
    wx.onThemeChange(({ theme }) => {
      globalData.darkmode = theme === "dark";
    });

  // 加载字体
  // wx.loadFontFace({
  //   family: "FZSSJW",
  //   source: `url("${server}assets/fonts/FZSSJW.ttf")`,
  //   global: true,
  //   complete: (res) => {
  //     // 调试
  //     console.info(`Font status: ${res.status}`, res);
  //   },
  // });

  updateNotice(globalData);
  updateApp(globalData);
  registerActions();
  login(globalData.appID, globalData.env, (openid) => {
    globalData.openid = openid;
  });
  if (globalData.env === "qq") checkGroupApp();

  const debug = wx.getStorageSync<boolean | undefined>("debugMode") || false;

  wx.setEnableDebug({ enableDebug: debug });
  (wx.env as Record<string, unknown>).DEBUG = debug;
};
