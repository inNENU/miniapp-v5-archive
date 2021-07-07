import { $Component, PropType } from "@mptool/enhance";
import { readFile } from "../../../utils/file";
import type {
  GridComponentConfig,
  GridComponentItemComfig,
} from "../../../../typings";

$Component({
  properties: {
    /** 网格组件配置 */
    config: {
      type: Object as PropType<GridComponentConfig>,
      value: { aim: "" },
    },
  },

  methods: {
    navigate({ currentTarget }: WechatMiniprogram.TouchEvent): void {
      this.$go(currentTarget.dataset.url);
    },
  },

  observers: {
    "config.content"(value: GridComponentItemComfig[]): void {
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
