import { $Component, PropType } from "@mptool/enhance";

import { readFile } from "../../../utils/file";

import type {
  ListComponentConfig,
  ListComponentItemConfig,
} from "../../../../typings";

$Component({
  properties: {
    /** 普通列表配置 */
    config: {
      type: Object as PropType<ListComponentConfig>,
      required: true,
    },
  },

  methods: {
    navigate({ currentTarget }: WechatMiniprogram.TouchEvent): void {
      this.$go(currentTarget.dataset.url);
    },
  },

  observers: {
    "config.content"(value: ListComponentItemConfig[]): void {
      // 设置图标
      this.setData({
        icons: value.map((item) =>
          item.icon && !item.icon.includes("/")
            ? readFile(`icon/${item.icon}`) || ""
            : ""
        ),
      });
    },
  },
});
