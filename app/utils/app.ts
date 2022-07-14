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
  appID: "wx33acb831ee1831a5" | "wx9ce37d9662499df3" | 1109559721;
  /** 是否能复制 */
  selectable: boolean;
}

/**
 * 资源下载
 *
 * @param fileName 下载资源名称
 * @param showProgress 是否开启进度提示
 */
export const resourceDownload = (
  fileName: string,
  showProgress = true
): Promise<void> =>
  new Promise((resolve, reject) => {
    if (showProgress) wx.showLoading({ title: "下载中...", mask: true });

    // 取消下载成功提示并移除对应资源文件
    fileName.split("-").forEach((resource) => {
      if (resource) {
        wx.setStorageSync(`${resource}Download`, false);
        if (exists(resource)) rm(resource, "dir");
      }
    });

    const downLoadTask = wx.downloadFile({
      url: `${server}r/${fileName}.zip`,
      success: ({ statusCode, tempFilePath }) => {
        if (statusCode === 200) {
          if (showProgress) wx.showLoading({ title: "保存中...", mask: true });

          // 保存压缩文件到压缩目录
          saveFile(tempFilePath, "zipTemp");

          if (showProgress) wx.showLoading({ title: "解压中...", mask: true });

          // 解压文件到根目录
          unzip("zipTemp", "").then(() => {
            // 删除压缩包
            rm("zipTemp", "file");

            // 将下载成功信息写入存储
            fileName.split("-").forEach((resource) => {
              if (resource) wx.setStorageSync(`${resource}Download`, true);
            });

            // 判断取消提示
            if (showProgress) wx.hideLoading();
            resolve();
          });
        } else reject(statusCode);
      },

      // 下载失败
      fail: ({ errMsg }) => {
        logger.error(`download ${fileName} fail: ${errMsg}`);
        reject(errMsg);
      },
    });

    downLoadTask.onProgressUpdate(({ progress }) => {
      if (showProgress)
        wx.showLoading({ title: `下载中...${progress}%`, mask: true });
    });
  });

let hasResPopup = false;

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
  let notify = wx.getStorageSync<boolean | undefined>("resourceNotify");
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

  if (currentTime > Number(localTime) + 604800 && !notify) {
    notify = true;
    wx.setStorageSync("resourceNotify", true);
    logger.debug("Resource Notify reset to true after 7 days");
  }

  // 需要检查更新
  if (notify && !hasResPopup)
    wx.request<VersionInfo>({
      url: `${server}service/resource.php`,
      enableHttp2: true,
      method: "POST",
      success: ({ statusCode, data }) => {
        // 资源为最新
        if (statusCode === 200) {
          const updateList: string[] = [];

          for (const key in data.version)
            if (data.version[key] !== localVersion[key]) updateList.push(key);

          // 需要更新
          if (updateList.length > 0) {
            // 调试
            logger.info("Newer resource detected");

            const fileName = updateList.join("-");
            const size = data.size[fileName];

            hasResPopup = true;

            // 需要提醒
            wx.showModal({
              title: "内容更新",
              content: `请更新小程序资源以获得最新内容。(会消耗${size}K流量)`,
              cancelText: "取消",
              cancelColor: "#ff0000",
              confirmText: "更新",
              success: ({ confirm, cancel }) => {
                // 用户确认，下载更新
                if (confirm)
                  resourceDownload(fileName).then(() => {
                    writeJSON("version", data.version);
                    hasResPopup = false;
                  });
                // 用户取消，警告用户
                else if (cancel)
                  wx.showModal({
                    title: "更新已取消",
                    content:
                      "您会错过本次新增与修正的小程序内容，导致的后果请您自负!",
                    confirmColor: "#ff0000",
                    confirmText: "确定",
                    showCancel: false,
                  });
              },
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

  resourceDownload("function-guide-icon-intro", false).then(() => {
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
export const noticeCheck = (globalData: GlobalData): void => {
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

export const checkGroupApp = (): void => {
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
                  wx.navigateTo({ url: "/moule/function?action=addGroupApp" });
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
    appID: wx.getAccountInfoSync().miniProgram.appId as
      | "wx33acb831ee1831a5"
      | "wx9ce37d9662499df3"
      | 1109559721,
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

  noticeCheck(globalData);
  appUpdate(globalData);
  registAction();
  login(globalData);
  checkGroupApp();

  const debug = wx.getStorageSync<boolean | undefined>("debugMode") || false;

  wx.setEnableDebug({ enableDebug: debug });
  (wx.env as Record<string, unknown>).DEBUG = debug;
};
