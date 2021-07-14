import { $Component } from "@mptool/enhance";
import { readFile } from "@mptool/file";

import type { PropType } from "@mptool/enhance";
import type {
  GridComponentConfig,
  GridComponentItemComfig,
} from "../../../../typings";

$Component({
  properties: {
    /** 网格组件配置 */
    config: {
      type: Object as PropType<GridComponentConfig>,
      required: true,
    },
  },

  lifetimes: {
    attached() {
      this.$emitter.on("inited", () => {
        this.setLogo(this.data.config.content);
      });
    },
  },

  methods: {
    // 设置图标
    setLogo(content: GridComponentItemComfig[]) {
      this.setData({
        icons: content.map((item) =>
          item.icon && !item.icon.includes("/")
            ? readFile(`icon/${item.icon}`) || ""
            : ""
        ),
      });
    },
  },

  observers: {
    "config.content"(value: GridComponentItemComfig[]): void {
      this.setLogo(value);
    },
  },
});
