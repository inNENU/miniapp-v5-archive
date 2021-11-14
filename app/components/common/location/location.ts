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

const startNavigation = (point: LocationConfig & { id: number }): void => {
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
      const { config, id, markers } = this.data;

      if (config.navigate !== false) {
        if (id === -1) {
          if (markers.length === 1) startNavigation(markers[0]);
          else tip("请选择一个点");
        } else startNavigation(markers[id]);
      }
    },

    markerTap({ detail }: WechatMiniprogram.MarkerTap) {
      const id = detail.markerId;
      const { markers } = this.data;

      this.setData({ id, title: markers[id].name });
    },

    calloutTap({ detail }: WechatMiniprogram.CalloutTap) {
      const { navigate } = this.data.config;

      if (env === "wx" && navigate !== false)
        startNavigation(this.data.markers[detail.markerId]);
    },
  },
});
