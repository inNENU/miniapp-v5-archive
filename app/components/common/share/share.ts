import $register = require("wxpage");
import { savePhoto } from "../../../utils/wx";
import { AppOption } from "../../../app";
const {
  globalData: { env, appID },
} = getApp<AppOption>(); // 获得日志管理器，全局数据

$register.C({
  properties: { config: { type: Object, value: { id: "" } } },
  data: {
    // 小程序运行环境
    env,
  },
  methods: {
    /** 二维码下载 */
    download(): void {
      savePhoto(`/img/QRCode/${appID}/${this.data.config.id}.png`);
    },
  },
});
