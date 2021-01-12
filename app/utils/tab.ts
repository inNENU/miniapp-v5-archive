import { GlobalData } from "../app";
import { PageData } from "../../typings";
import { requestJSON } from "./wx";
import { setPage } from "./page";

/**
 * 刷新 tab 页
 *
 * @param name 页面名称
 * @param ctx 页面指针
 * @param globalData 全局数据
 */
export const refreshPage = (
  name: string,
  ctx: WechatMiniprogram.Page.MPInstance<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any>
  >,
  globalData: GlobalData
): void => {
  const test = wx.getStorageSync("test") as boolean;

  // 开启测试后展示测试界面
  if (test)
    requestJSON(`resource/config/${globalData.appID}/test/${name}`, (data) => {
      setPage({ ctx, option: { id: name } }, data as PageData);
    });
  // 普通界面加载
  else
    requestJSON(
      `resource/config/${globalData.appID}/${globalData.version}/${name}`,
      (data) => {
        wx.setStorageSync(name, data);
        setPage({ ctx, option: { id: name } }, data as PageData);
      }
    );
};
