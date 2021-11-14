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

const getMarker = (point: LocationConfig & { id: number }): string =>
  JSON.stringify({
    name: point.name,
    latitude: point.latitude,
    longitude: point.longitude,
  });

const startNavigation = (point: LocationConfig & { id: number }): void => {
  wx.navigateTo({
    url: `plugin://routePlan/index?key=NLVBZ-PGJRQ-T7K5F-GQ54N-GIXDH-FCBC4&referer=${referer}&endPoint=${getMarker(
      point
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
          detail: "详情",
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
      const point = this.data.markers[id];

      this.setData({ id, title: point.name });

      if (point.path) this.$preload(`location?id=${point.path}`);
    },

    calloutTap({ detail }: WechatMiniprogram.CalloutTap) {
      const point = this.data.markers[detail.markerId];
      const { navigate } = this.data.config;

      if (point.path)
        this.$go(`location?id=${point.path}&marker=${getMarker(point)}`);
      if (env === "wx" && navigate !== false)
        startNavigation(this.data.markers[detail.markerId]);
    },
  },
});
