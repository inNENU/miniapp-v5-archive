/* eslint-disable max-lines */
import { emitter, logger } from "@mptool/enhance";
import {
  ls,
  rm,
  unzip,
  writeJSON,
  saveFile,
  readJSON,
  exists,
} from "@mptool/file";

import { appConfig, server, version } from "./config";
import { modal, requestJSON, tip } from "./wx";

import type { PageData, VersionInfo } from "../../typings";

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
  appID: string;
}

/**
 * 资源下载
 *
 * @param fileName 下载资源名称
 * @param progress 是否开启进度提示
 */
export const resDownload = (fileName: string, progress = true): Promise<void> =>
  new Promise((resolve, reject) => {
    if (progress) wx.showLoading({ title: "下载中...", mask: true });

    // 取消下载成功提示并移除对应资源文件
    fileName.split("-").forEach((res) => {
      if (res) {
        wx.setStorageSync(`${res}Download`, false);
        if (exists(res)) rm(res, "dir");
      }
    });

    const downLoadTask = wx.downloadFile({
      url: `${server}resource/${fileName}.zip`,
      success: (res) => {
        if (res.statusCode === 200) {
          if (progress) wx.showLoading({ title: "保存中...", mask: true });

          // 保存压缩文件到压缩目录
          saveFile(res.tempFilePath, "zipTemp");

          if (progress) wx.showLoading({ title: "解压中...", mask: true });

          // 解压文件到根目录
          unzip("zipTemp", "", () => {
            // 删除压缩包
            rm("zipTemp", "file");

            // 将下载成功信息写入存储
            fileName.split("-").forEach((resource) => {
              if (resource) wx.setStorageSync(`${resource}Download`, true);
            });

            // 判断取消提示
            if (progress) wx.hideLoading();
            resolve();
          });
        } else reject(res.statusCode);
      },

      // 下载失败
      fail: ({ errMsg }) => {
        logger.error(`download ${fileName} fail: ${errMsg}`);
        reject(errMsg);
      },
    });

    downLoadTask.onProgressUpdate((res) => {
      if (progress)
        wx.showLoading({ title: `下载中...${res.progress}%`, mask: true });
    });
  });

/**
 * 检查资源更新
 *
 * @param path 检查资源的路径
 * @param name 检查资源的名称
 * @param dataUsage 消耗的数据流量
 */
// eslint-disable-next-line max-lines-per-function
export const checkResUpdate = (): void => {
  /** 资源提醒状态 */
  const notify = wx.getStorageSync<boolean | undefined>("resourceNotify");
  /** 本地资源版本 */
  const localVersion: Record<string, number> = readJSON("version") || {};
  /** 上次更新时间 */
  const localTime = wx.getStorageSync<number | undefined>(`resourceUpdateTime`);
  /** 当前时间 */
  const currentTime = Math.round(new Date().getTime() / 1000);

  // 调试
  logger.debug(
    `Resource Notify status: ${notify ? "open" : "close"}`,
    "Local resource version: ",
    localVersion
  );

  if (notify || currentTime > Number(localTime) + 604800)
    // 如果需要更新
    wx.request<VersionInfo>({
      url: `${server}service/version.php`,
      enableHttp2: true,
      success: (res) => {
        // 资源为最新
        if (res.statusCode === 200) {
          const versionInfo = res.data;
          const updateList: string[] = [];

          for (const key in versionInfo.version)
            if (versionInfo.version[key] !== localVersion[key])
              updateList.push(key);

          // 需要更新
          if (updateList.length > 0) {
            // 调试
            logger.info("Newer resource detected");

            const fileName = updateList.join("-");
            const size = versionInfo.size[fileName];

            if (notify)
              // 需要提醒
              wx.showModal({
                title: "内容更新",
                content: `请更新资源以获得最新功能与内容。(会消耗${size}K流量)`,
                cancelText: "取消",
                cancelColor: "#ff0000",
                confirmText: "更新",
                success: (choice) => {
                  // 用户确认，下载更新
                  if (choice.confirm)
                    resDownload(fileName).then(() => {
                      writeJSON("version", versionInfo.version);
                    });
                  // 用户取消，询问是否关闭更新提示
                  else if (choice.cancel)
                    wx.showModal({
                      title: "开启资源更新提示?",
                      content: "开启后在资源有更新时会提示您更新资源文件。",
                      cancelText: "关闭",
                      cancelColor: "#ff0000",
                      confirmText: "保持开启",
                      success: (choice2) => {
                        // 用户选择关闭
                        if (choice2.cancel)
                          modal(
                            "更新提示已关闭",
                            "您可以在设置中重新打开提示。\n请注意: 为保障正常运行，小程序会每周对资源进行强制更新。",
                            // 关闭更新提示
                            () => {
                              wx.setStorageSync("resourceNotify", false);
                            }
                          );
                      },
                    });
                },
              });
            // 距上次更新已经半个月了，强制更新
            else
              resDownload(fileName).then(() => {
                writeJSON("version", versionInfo.version);
              });
          }
          // 调试
          else logger.debug("Newest resource already downloaded");
        } else tip("服务器出现问题");
      },
      fail: () => tip("服务器出现问题"),
    });
};

/** 初始化小程序 */
export const appInit = (): void => {
  // 提示用户正在初始化
  wx.showLoading({ title: "初始化中...", mask: true });
  logger.info("Fist launch");

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

  resDownload("function-guide-icon-intro", false).then(() => {
    // 下载资源文件并写入更新时间
    const timeStamp = new Date().getTime();

    wx.setStorageSync("resourceUpdateTime", Math.round(timeStamp / 1000));

    wx.request<VersionInfo>({
      url: `${server}service/version.php`,
      enableHttp2: true,
      success: (res) => {
        console.log("Version info", res.data);
        if (res.statusCode === 200) {
          writeJSON("version", res.data.version);
          // 成功初始化
          wx.setStorageSync("innenu-inited", true);
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
export const noticeCheck = (globalData: GlobalData): void => {
  requestJSON<Record<string, Notice>>(
    `resource/config/${globalData.appID}/${globalData.version}/notice`,
    (noticeList) => {
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
      logger.warn("noticeList error", "Net Error");
    },
    () => {
      // 调试信息
      logger.error("noticeList error", "Address Error");
    }
  );
};

/**
 * 根据用户设置，判断当前小程序是否应启用夜间模式
 *
 * @returns 夜间模式状态
 */
export const getDarkmode = (
  sysInfo: WechatMiniprogram.SystemInfo = wx.getSystemInfoSync()
): boolean => (sysInfo.AppPlatform ? false : sysInfo.theme === "dark");

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
  if (wx.canIUse("getUpdateManager")) {
    const updateManager = wx.getUpdateManager();

    // 检查更新
    updateManager.onCheckForUpdate(({ hasUpdate }) => {
      // 找到更新，提示用户获取到更新
      if (hasUpdate) tip("发现小程序更新，下载中...");
    });

    updateManager.onUpdateReady(() => {
      // 请求配置文件
      requestJSON<string>(
        `resource/config/${globalData.appID}/version`,
        (version) => {
          // 请求配置文件
          requestJSON<UpdateInfo>(
            `resource/config/${globalData.appID}/${version}/config`,
            ({ forceUpdate, reset }) => {
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
export const login = ({ appID, env }: GlobalData): void => {
  const openid = wx.getStorageSync<string | undefined>("openid");

  if (openid) console.info(`User OPENID: ${openid}`);
  else
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
            },
          });
      },
      fail: ({ errMsg }) => {
        console.error(`Login failed: ${errMsg}`);
      },
    });
};

/** 注册全局监听 */
export const registAction = (): void => {
  // 设置内存不足警告
  wx.onMemoryWarning((res) => {
    tip("内存不足");
    console.warn("Memory warning received.");
    wx.reportAnalytics("memory_warning", {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      memory_warning: res && res.level ? res.level : 0,
    });
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
      const status = wx.getStorageSync<"never" | "noticed" | undefined>(
        "capture-screen"
      );

      if (status !== "never")
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
    appID: wx.getAccountInfoSync().miniProgram.appId,
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
    success: (res) => {
      const { networkType } = res;

      if (networkType === "none" || networkType === "unknown")
        tip("您的网络状态不佳");
    },
  });

  noticeCheck(globalData);
  appUpdate(globalData);
  registAction();
  login(globalData);
};
