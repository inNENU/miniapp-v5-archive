import { $Component } from "@mptool/enhance";
import { getTitle } from "../../../utils/config";
import { tip } from "../../../utils/wx";

import type { PropType } from "@mptool/enhance";
import type {
  LocationComponentOptions,
  LocationConfig,
} from "../../../../typings";
import type { AppOption } from "../../../app";

const { globalData } = getApp<AppOption>();
const { env } = globalData;
const referer = getTitle();

const navigate = (point: LocationConfig & { id: number }): void => {
  wx.navigateTo({
    url: `plugin://routePlan/index?key=NLVBZ-PGJRQ-T7K5F-GQ54N-GIXDH-FCBC4&referer=${referer}&endPoint=${JSON.stringify(
      {
        name: point.name,
        latitude: point.latitude,
        longitude: point.longitude,
      }
    )}&mode=walking&themeColor=#2ecc71`,
  });
};

$Component({
  properties: {
    /** 普通列表配置 */
    config: {
      type: Object as PropType<LocationComponentOptions>,
      required: true,
    },
  },

  data: {
    darkmode: globalData.darkmode,
    env,
    markers: [] as (LocationConfig & { id: number })[],
    id: -1,
    title: "",
  },

  lifetimes: {
    attached() {
      const { config } = this.data;

      this.setData({
        title: config.title,
        markers: config.points.map((point, index) => ({
          name: config.title,
          detail: env === "wx" ? "导航" : "",
          id: index,
          ...point,
        })),
        includePoints: config.points.map((point) => ({
          longitude: point.longitude,
          latitude: point.latitude,
        })),
      });
    },
  },

  methods: {
    navigate() {
      const { id, markers } = this.data;

      if (id === -1) {
        if (markers.length === 1) navigate(markers[0]);
        else tip("请选择一个点");
      } else navigate(markers[id]);
    },

    markerTap({ detail }: WechatMiniprogram.MarkerTap) {
      const id = detail.markerId;
      const { markers } = this.data;

      this.setData({ id, title: markers[id].name });
    },

    calloutTap({ detail }: WechatMiniprogram.CalloutTap) {
      if (env === "wx") navigate(this.data.markers[detail.markerId]);
    },
  },
});
