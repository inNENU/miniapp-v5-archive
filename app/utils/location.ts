import { appName } from "./config";

const referer = appName;

export const navigation = (point: string): void => {
  wx.navigateTo({
    url: `plugin://routePlan/index?key=7ZXBZ-DZO6W-TK3RO-OGHG5-4J4EQ-PBFFX&referer=${referer}&endPoint=${point}&mode=walking&themeColor=#2ecc71`,
  });
};
