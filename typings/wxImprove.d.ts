declare namespace WechatMiniprogram {
  /** 地图设置 */
  interface MapSettings {
    /** 倾斜角度，范围 0 ~ 40 , 关于 z 轴的倾角.默认为 0 */
    skew?: number;
    /** 旋转角度，范围 0 ~ 360, 地图正北和设备 y 轴角度的夹角，默认为 0 */
    rotate?: number;

    /** 显示带有方向的当前定位点，默认为 false */
    showLocation?: boolean;
    /** 显示比例尺，默认为 false */
    showScale?: boolean;
    /** 显示指南针，默认为 false */
    showCompass?: boolean;

    /** 个性化地图使用的key */
    subKey?: string;
    /** 个性化地图配置的 style，不支持动态修改 */
    layerStyle?: number;

    /** 显是否支持缩放，默认为 true */
    enableZoom?: boolean;
    /** 是否支持拖动，默认为 true */
    enableScroll?: boolean;
    /** 是否支持旋转，默认为 false */
    enableRotate?: boolean;
    /** 展示3D楼块，默认为 false */
    enable3D?: boolean;
    /** 开启俯视，默认为 false */
    enableOverlooking?: boolean;
    /** 是否开启卫星图，默认为 false */
    enableSatellite?: boolean;
    /** 是否开启实时路况，默认为 false */
    enableTraffic?: boolean;
  }

  interface RequestResult<T> extends RequestSuccessCallbackResult {
    data: T;
  }

  interface NodeRectInfo {
    top: number;
    right: number;
    bottom: number;
    left: number;
  }

  interface NodeSizeInfo {
    width: number;
    height: number;
  }

  interface NodeScrollOffsetInfo {
    scrollLeft?: number;
    scrollTop?: number;
  }

  type NodeInfo = Partial<
    NodeRectInfo &
      NodeSizeInfo &
      NodeScrollOffsetInfo & {
        id: string;
        mark: IAnyObject;
        dataset: IAnyObject;
        properties: string[];
        computedStyle: string[];
        node: {
          getContext: (type: string) => CanvasContext;
        } & NodeRectInfo &
          NodeSizeInfo;
      }
  >;

  namespace Component {
    interface Constructor {
      <
        TData extends DataOption = DataOption,
        TProperty extends PropertyOption = PropertyOption,
        TMethod extends MethodOption = MethodOption,
        TCustomInstanceProperty extends IAnyObject = IAnyObject
      >(
        options: Options<TData, TProperty, TMethod, TCustomInstanceProperty>
      ): string;
    }
  }

  namespace Page {
    interface ILifetime {
      /**
       * 监听右上角菜单“分享到朋友圈”按钮的行为，并自定义分享内容
       *
       * 本接口为 Beta 版本，暂只在 Android 平台支持，详见 [分享到朋友圈 (Beta)](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/share-timeline.html)
       *
       * 基础库 2.11.3 开始支持，低版本需做兼容处理。
       */
      onShareTimeline(): ICustomTimelineContent | void;
    }

    interface ICustomTimelineContent {
      /** 自定义标题，即朋友圈列表页上显示的标题。默认值：当前小程序名称 */
      title?: string;
      /** 自定义页面路径中携带的参数，如 `path?a=1&b=2` 的 “?” 后面部分 默认值：当前页面路径携带的参数 */
      query?: string;
      /** 自定义图片路径，可以是本地文件路径、代码包文件路径或者网络图片路径。支持 PNG 及 JPG。显示图片长宽比是 1:1。默认值：默认使用小程序 Logo*/
      imageUrl?: string;
    }
  }
}
