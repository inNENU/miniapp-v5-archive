import { TextComponentConfig } from "../../../../typings";

Component<{ config: TextComponentConfig }>({
  properties: {
    /** 段落配置 */
    config: Object,
  },

  options: {
    styleIsolation: "shared",
  },
});
