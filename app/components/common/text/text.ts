import { TextComponentConfig } from "../../../../typings";

Component<{ config: TextComponentConfig }>({
  properties: {
    /** 段落配置 */
    config: { type: Object },
  },

  options: {
    styleIsolation: "shared",
  },
});
