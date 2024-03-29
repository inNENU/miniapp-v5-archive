import { $Component } from "@mptool/enhance";
import { downLoad, modal, savePhoto, tip } from "../../../utils/api";

import type { PropType } from "@mptool/enhance";
import type { DocComponentOptions } from "../../../../typings";

$Component({
  properties: {
    /** 配置 */
    config: {
      type: Object as PropType<DocComponentOptions>,
      required: true,
    },
  },

  methods: {
    view(): void {
      const { icon, url } = this.data.config;

      // 检测到文档
      if (["doc", "ppt", "xls", "pdf"].includes(icon))
        downLoad(url)
          .then((filePath) => {
            wx.openDocument({
              filePath,
              showMenu: true,
              success: () => {
                console.log(`Open document ${url} success`);
              },
              fail: ({ errMsg }) => {
                console.log(`Open document ${url} failed: ${errMsg}`);
              },
            });
          })
          .catch(() => {
            tip(`下载文档失败`);
            wx.reportEvent?.("resource_load_failed", {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              broken_url: url,
            });
          });
      else if (["jpg", "png", "gif"].includes(icon))
        // 检测到图片，开始图片浏览
        wx.previewImage({ urls: [url] });
    },

    /** 下载文档 */
    download(): void {
      const { icon, name, url } = this.data.config;

      if (["doc", "ppt", "xls", "pdf"].includes(icon))
        downLoad(url)
          .then((filePath) => {
            wx.addFileToFavorites({
              fileName: name,
              filePath,
              success: () => {
                console.log(`Add document ${url} to favorites success`);
                modal("文件已保存", "文件已保存至“微信收藏”");
              },
              fail: ({ errMsg }) => {
                console.log(
                  `Add document ${url} to favorites failed: ${errMsg}`
                );
              },
            });
          })
          .catch(() => {
            tip(`下载文档失败`);
            wx.reportEvent?.("resource_load_failed", {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              broken_url: url,
            });
          });
      else if (["jpg", "png", "gif"].includes(icon))
        // 检测到图片，开始图片下载
        savePhoto(url).then(() => tip("已保存至相册"));
    },
  },
});
