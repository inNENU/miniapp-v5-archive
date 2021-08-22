import { $Component } from "@mptool/enhance";
import { modal, savePhoto, tip } from "../../../utils/wx";

import type { PropType } from "@mptool/enhance";
import type { DocComponentConfig } from "../../../../typings";

$Component({
  properties: {
    /** 配置 */
    config: {
      type: Object as PropType<DocComponentConfig>,
      required: true,
    },
  },

  methods: {
    view(): void {
      const { icon, url } = this.data.config;

      // 检测到文档
      if (["doc", "ppt", "xls", "pdf"].includes(icon)) {
        // 显示下载提示
        wx.showLoading({ title: "下载中...0%", mask: true });

        // 开始下载文件
        const docTask = wx.downloadFile({
          url,

          // 下载成功，隐藏下载提示并打开文档
          success: (data) => {
            wx.hideLoading();
            wx.openDocument({
              filePath: data.tempFilePath,
              showMenu: true,
              success: () => {
                console.log(`Open document ${url} success`);
              },
              fail: ({ errMsg }) => {
                console.log(`Open document ${url} failed: ${errMsg}`);
              },
            });
          },

          // 下载失败，隐藏下载提示告知用户下载失败并上报
          fail: () => {
            wx.hideLoading();
            tip(`下载文档失败`);
            wx.reportMonitor("9", 1);
          },
        });

        // 监听下载进度，并更新弹窗显示
        docTask.onProgressUpdate((data) => {
          wx.showLoading({ title: `下载中...${data.progress}%`, mask: true });
        });

        // 检测到图片，开始图片浏览
      } else if (["jpg", "png", "gif"].includes(icon))
        wx.previewImage({ urls: [url] });
    },

    /** 下载文档 */
    download(): void {
      const { icon, url } = this.data.config;

      if (["doc", "ppt", "xls", "pdf"].includes(icon))
        // 检测到文档
        wx.setClipboardData({
          data: url,
          success: () => {
            modal(
              "复制成功",
              "下载链接已复制到您的剪切板。受小程序限制，请您自行打开浏览器粘贴在地址栏中以开启下载。"
            );
          },
        });
      else if (["jpg", "png", "gif"].includes(icon))
        // 检测到图片，开始图片下载
        savePhoto(url);
    },
  },
});
