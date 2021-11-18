import { $Component } from "@mptool/enhance";
import { readFile } from "@mptool/file";

import type { PropType } from "@mptool/enhance";
import type {
  GridComponentOptions,
  GridComponentItemOptions,
} from "../../../../typings";

$Component({
  properties: {
    /** 网格组件配置 */
    config: {
      type: Object as PropType<GridComponentOptions>,
      required: true,
    },
  },

  methods: {
    // 设置图标
    setLogo(content?: GridComponentItemOptions[]) {
      this.setData({
        icons: (content || this.data.config.content).map((item) =>
          item.icon && !item.icon.includes("/")
            ? readFile(`icon/${item.icon}`) || ""
            : ""
        ),
      });
    },
  },

  lifetimes: {
    attached() {
      this.setLogo = this.setLogo.bind(this);
      this.$on("inited", this.setLogo);
    },
    detached() {
      this.$off("inited", this.setLogo);
    },
  },

  observers: {
    "config.content"(value: GridComponentItemOptions[]): void {
      this.setLogo(value);
    },
  },
});
