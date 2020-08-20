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
      wx.makePhoneCall({ phoneNumber: this.data.config.num });
    },

    /** 添加联系人 */
    addContact(): void {
      const { config } = this.data;

      if (env === "qq")
        wx.setClipboardData({
          data: config.num,
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
          firstName: config.fName,
          lastName: config.lName,
          mobilePhoneNumber: config.num,
          organization: config.org,
          workPhoneNumber: config.workNum,
          remark: config.remark,
          photoFilePath: config.head,
          nickName: config.nickName,
          weChatNumber: config.wechat,
          addressState: config.province,
          addressCity: config.city,
          addressStreet: config.street,
          addressPostalCode: config.postCode,
          title: config.title,
          hostNumber: config.hostNum,
          email: config.email,
          url: config.website,
          homePhoneNumber: config.homeNum,
        });
    },
  },
});
