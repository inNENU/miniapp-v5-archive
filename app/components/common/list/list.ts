import { $Component } from "@mptool/enhance";
import { readFile } from "@mptool/file";

import type { PropType } from "@mptool/enhance";
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

  lifetimes: {
    attached() {
      this.$emitter.on("inited", () => {
        this.setLogo(this.data.config.content);
      });
    },
  },

  methods: {
    // 设置图标
    setLogo(content: ListComponentItemConfig[]) {
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
    "config.content"(value: ListComponentItemConfig[]): void {
      this.setLogo(value);
    },
  },
});
