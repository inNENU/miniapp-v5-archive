import { $Component } from "@mptool/enhance";
import { startNavigation } from "../../../utils/location";
import { tip } from "../../../utils/wx";

import type { PropType } from "@mptool/enhance";
import type {
  LocationComponentOptions,
  LocationConfig,
} from "../../../../typings";
import type { AppOption } from "../../../app";

const { globalData } = getApp<AppOption>();
const { env } = globalData;

const getPoint = (point: LocationConfig & { id: number }): string =>
  JSON.stringify({
    name: point.name,
    latitude: point.latitude,
    longitude: point.longitude,
  });

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
    hasDetail: false,
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
          if (markers.length === 1) startNavigation(getPoint(markers[0]));
          else tip("请选择一个点");
        } else startNavigation(getPoint(markers[id]));
      }
    },

    detail() {
      const { id, hasDetail } = this.data;

      if (hasDetail) {
        const point = this.data.markers[id];

        this.$go(
          `location?id=${point.path as string}&point=${getPoint(point)}`
        );
      }
    },

    markerTap({ detail }: WechatMiniprogram.MarkerTap) {
      const id = detail.markerId;
      const point = this.data.markers[id];

      this.setData({ id, title: point.name, hasDetail: Boolean(point.path) });

      if (point.path) this.$preload(`location?id=${point.path}`);
    },

    calloutTap({ detail }: WechatMiniprogram.CalloutTap) {
      const point = this.data.markers[detail.markerId];
      const { navigate } = this.data.config;

      if (point.path)
        this.$go(`location?id=${point.path}&point=${getPoint(point)}`);
      else if (env === "wx" && navigate !== false)
        startNavigation(getPoint(this.data.markers[detail.markerId]));
    },
  },
});
