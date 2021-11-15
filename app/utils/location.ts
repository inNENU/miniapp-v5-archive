import { getTitle } from "./config";

const referer = getTitle();

export const navigation = (point: string): void => {
  wx.navigateTo({
    url: `plugin://routePlan/index?key=NLVBZ-PGJRQ-T7K5F-GQ54N-GIXDH-FCBC4&referer=${referer}&endPoint=${point}&mode=walking&themeColor=#2ecc71`,
  });
};
