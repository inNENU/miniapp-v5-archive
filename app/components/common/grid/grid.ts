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

  methods: {
    // 设置图标
    setLogo(content?: GridComponentItemComfig[]) {
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
      this.$emitter.on("inited", this.setLogo);
    },
    detached() {
      this.$emitter.off("inited", this.setLogo);
    },
  },

  observers: {
    "config.content"(value: GridComponentItemComfig[]): void {
      this.setLogo(value);
    },
  },
});
