import $register = require("wxpage");
import {
  ListComponentConfig,
  ListComponentItemConfig,
} from "../../../../typings";
import { readFile } from "../../../utils/file";

$register.C<{ config: ListComponentConfig }>({
  properties: {
    /** 普通列表配置 */
    config: Object,
  },

  methods: {
    navigate({ currentTarget }: WechatMiniprogram.TouchEvent): void {
      this.$route(currentTarget.dataset.url);
    },
  },

  observers: {
    "config.content"(value: ListComponentItemConfig[]): void {
      // 设置图标
      this.setData({
        icons: value.map((item) =>
          "base64Icon" in item ? readFile(`icon/${item.base64Icon}`) || "" : ""
        ),
      });
    },
  },
});
