import $register = require("wxpage");
import { AppOption } from "../../../app";
import { modal } from "../../../utils/wx";
const {
  globalData: { env },
} = getApp<AppOption>(); // 获得当前小程序环境

$register.C({
  properties: {
    /** 电话组件配置 */
    config: Object as any,
  },
  methods: {
    /** 拨打电话 */
    call(): void {
      wx.makePhoneCall({ phoneNumber: this.data.config.num.toString() });
    },

    /** 添加联系人 */
    addContact(): void {
      if (env === "qq")
        wx.setClipboardData({
          data: this.data.config.num,
          success: () => {
            modal(
              "号码已复制到剪切板",
              "QQ暂不支持直接添加联系人，请自行添加联系人"
            );
          },
        });
      else
        wx.addPhoneContact({
          // 添加联系人
          firstName: this.data.config.fName,
          lastName: this.data.config.lName,
          mobilePhoneNumber: this.data.config.num,
          organization: this.data.config.org,
          workPhoneNumber: this.data.config.workNum,
          remark: this.data.config.remark,
          photoFilePath: this.data.config.head,
          nickName: this.data.config.nickName,
          weChatNumber: this.data.config.wechat,
          addressState: this.data.config.province,
          addressCity: this.data.config.city,
          addressStreet: this.data.config.street,
          addressPostalCode: this.data.config.postCode,
          title: this.data.config.title,
          hostNumber: this.data.config.hostNum,
          email: this.data.config.email,
          url: this.data.config.website,
          homePhoneNumber: this.data.config.homeNum,
        });
    },
  },
});
