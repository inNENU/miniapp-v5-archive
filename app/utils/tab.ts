import { remove, readJSON, saveFile, unzip } from "./file";
import { debug, error, info } from "./log";
import { modal, requestJSON, tip } from "./wx";
import { GlobalData } from "../app";
import { server } from "./config";
import { setPage } from "./page";
import { PageConfig } from "../../typings";

/**
 * 资源下载 from fuction.js & guide.js 被 checkResUpdate 调用
 *
 * @param name 下载资源名称
 */
export const resDownload = (name: string): void => {
  wx.showLoading({ title: "更新中...", mask: true });
  wx.setStorageSync(`${name}Download`, false);
  remove(name, "dir");
  const downLoadTask = wx.downloadFile({
    url: `${server}resource/${name}.zip`,
    success: (res) => {
      if (res.statusCode === 200) {
        wx.showLoading({ title: "保存中...", mask: true });

        // 保存压缩文件到压缩目录
        saveFile(res.tempFilePath, `${name}Zip`);

        wx.showLoading({ title: "解压中...", mask: true });

        // 解压文件到根目录
        unzip(`${name}Zip`, "", () => {
          // 删除压缩目录，并将下载成功信息写入存储、判断取消提示
          remove(`${name}Zip`, "file");
          wx.setStorageSync(`${name}Download`, true);

          wx.hideLoading();
        });
      }
    },

    // 下载失败
    fail: (failMsg) => error(`download ${name} fail:`, failMsg),
  });

  downLoadTask.onProgressUpdate((res) => {
    wx.showLoading({ title: `下载中...${res.progress}%`, mask: true });
  });
};

/**
 * 检查资源更新
 *
 * @param path 检查资源的路径
 * @param name 检查资源的名称
 * @param dataUsage 消耗的数据流量
 */
// eslint-disable-next-line max-lines-per-function
export const checkResUpdate = (
  path: string,
  name: string,
  dataUsage: string
): void => {
  const notify = wx.getStorageSync(`${path}ResNotify`); // 资源提醒
  const localVersion = readJSON(`${path}Version`); // 读取本地Version文件
  const localTime = wx.getStorageSync(`${path}UpdateTime`);
  const currentTime = Math.round(new Date().getTime() / 1000); // 读取当前和上次更新时间

  // 调试
  debug(`${name}通知状态为${notify}`, `本地版本文件为: ${localVersion}`);
  debug(`${name}更新于${localTime}, 现在时间是${currentTime}`);

  if (notify || currentTime > Number(localTime) + 604800)
    // 如果需要更新
    wx.request({
      url: `${server}service/resVersion.php?res=${path}`,
      enableHttp2: true,
      success: (res) => {
        // 资源为最新
        if (res.statusCode === 200)
          if (Number(localVersion) === Number(res.data))
            // 调试
            debug(`${name}资源已是最新版`);
          // 需要更新
          else {
            info(`${name}资源有更新`); // 调试

            // 如果需要提醒，则弹窗
            if (notify)
              wx.showModal({
                title: `${name}有更新`,
                content: `请更新资源以获得最新功能与内容。(会消耗${dataUsage}流量)`,
                cancelText: "取消",
                cancelColor: "#ff0000",
                confirmText: "更新",
                success: (choice) => {
                  // 用户确认，下载更新
                  if (choice.confirm) resDownload(path);
                  // 用户取消，询问是否关闭更新提示
                  else if (choice.cancel)
                    wx.showModal({
                      title: "开启资源更新提示？",
                      content: "开启后在资源有更新时会提示您更新资源文件。",
                      cancelText: "关闭",
                      cancelColor: "#ff0000",
                      confirmText: "保持开启",
                      success: (choice2) => {
                        // 用户选择关闭
                        if (choice2.cancel)
                          modal(
                            "更新提示已关闭",
                            "您可以在设置中重新打开提示。请注意: 为保障正常运行，小程序会每周对资源进行强制更新。",
                            // 关闭更新提示
                            () => {
                              wx.setStorageSync(`${path}ResNotify`, false);
                            }
                          );
                      },
                    });
                },
              });
            // 距上次更新已经半个月了，强制更新
            else resDownload(path);
          }
        else tip("服务器出现问题");
      },
      fail: () => tip("服务器出现问题"),
    });
};

/**
 * 刷新 tab 页
 *
 * @param name 页面名称
 * @param ctx 页面指针
 * @param globalData 全局数据
 */
export const refreshPage = (
  name: string,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  ctx: any,
  globalData: GlobalData
): void => {
  const test = wx.getStorageSync("test");

  // 开启测试后展示测试界面
  if (test)
    requestJSON(`resource/config/${globalData.appID}/test/${name}`, (data) => {
      setPage({ ctx, option: { id: name } }, data as PageConfig);
    });
  // 普通界面加载
  else
    requestJSON(
      `resource/config/${globalData.appID}/${globalData.version}/${name}`,
      (data) => {
        wx.setStorageSync(name, data);
        setPage({ ctx, option: { id: name } }, data as PageConfig);
      }
    );
};
