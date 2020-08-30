import $register = require("wxpage");
import { DocComponentConfig } from "../../../../typings";
import { modal, savePhoto, tip } from "../../../utils/wx";

$register.C<{ config: DocComponentConfig }>({
  properties: {
    /** 配置 */
    config: { type: Object },
  },

  methods: {
    view(): void {
      // 检测到文档
      if (["doc", "ppt", "xls", "pdf"].includes(this.data.config.icon)) {
        // 显示下载提示
        wx.showLoading({ title: "下载中...0%", mask: true });

        // 开始下载文件
        const docTask = wx.downloadFile({
          url: this.data.config.url,

          // 下载成功，隐藏下载提示并打开文档
          success: (data) => {
            wx.hideLoading();
            wx.openDocument({
              filePath: data.tempFilePath,
              showMenu: true,
              success: () => {
                console.log("成功打开文档");
              },
              fail: ({ errMsg }) => {
                console.log(`打开文档失败: ${errMsg}`);
              },
            });
          },

          // 下载失败，隐藏下载提示告知用户下载失败并上报
          fail: () => {
            wx.hideLoading();
            tip("文档下载失败");
            wx.reportMonitor("9", 1);
          },
        });

        // 监听下载进度，并更新弹窗显示
        docTask.onProgressUpdate((data) => {
          wx.showLoading({ title: `下载中...${data.progress}%`, mask: true });
        });

        // 检测到图片，开始图片浏览
      } else if (["jpg", "png", "gif"].includes(this.data.config.icon))
        wx.previewImage({ urls: [this.data.config.url] });
    },

    /** 下载文档 */
    download(): void {
      if (["doc", "ppt", "xls", "pdf"].includes(this.data.config.icon))
        // 检测到文档
        wx.setClipboardData({
          data: this.data.config.url,
          success: () => {
            modal(
              "复制成功",
              "下载链接已复制到您的剪切板。受小程序限制，请您自行打开浏览器粘贴在地址栏中以开启下载。"
            );
          },
        });
      else if (["jpg", "png", "gif"].includes(this.data.config.icon))
        // 检测到图片，开始图片下载
        savePhoto(this.data.config.url);
    },
  },
});
