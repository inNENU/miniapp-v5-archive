declare namespace WechatMiniprogram {
  interface SystemInfo {
    /** 运行环境 */
    // eslint-disable-next-line @typescript-eslint/naming-convention
    AppPlatform: "qq" | undefined;
  }

  interface AuthSetting {
    "setting.addFriend"?: boolean;
  }

  /** 接口调用结束的回调函数(调用成功、失败都会执行) */
  type SaveAppToDesktopCompleteCallback = (res: GeneralCallbackResult) => void;
  /** 接口调用失败的回调函数 */
  type SaveAppToDesktopFailCallback = (res: GeneralCallbackResult) => void;
  /** 接口调用成功的回调函数 */
  type SaveAppToDesktopSuccessCallback = (res: GeneralCallbackResult) => void;

  interface SaveAppToDesktopOption {
    /** 接口调用结束的回调函数(调用成功、失败都会执行) */
    complete?: SaveAppToDesktopCompleteCallback;
    /** 接口调用失败的回调函数 */
    fail?: SaveAppToDesktopFailCallback;
    /** 接口调用成功的回调函数 */
    success?: SaveAppToDesktopSuccessCallback;
  }

  interface Wx {
    /** 在手机桌面上添加该小程序的快捷启动图标。 */
    saveAppToDesktop(option?: SaveAppToDesktopOption): void;
  }
}
