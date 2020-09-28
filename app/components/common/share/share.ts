import { AppOption } from "../../../app";
import { savePhoto } from "../../../utils/wx";
const {
  globalData: { env, appID },
} = getApp<AppOption>(); // 获得日志管理器，全局数据

Component({
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
