import type { ComponentConfig } from "./components";
import type { PageConfig } from "../server/typings";

/** 页面数据 */
export interface PageData extends Partial<PageConfig> {
  /** 状态栏高度 */
  statusBarHeight?: number;
  /** 页面深度 */
  depth?: number;
  /** 页面来源 */
  from?: string;
  /** 是否加载失败 */
  error?: true;
  /** 左上角操作 */
  action?: string | boolean;

  /** 是否显示标题(仅 iOS 主题) */
  titleDisplay?: boolean;
  /** 是否显示分割线(仅 iOS 主题) */
  borderDisplay?: boolean;
  /** 是否显示阴影(仅 Android 主题) */
  shadow?: boolean;
  content?: ComponentConfig[];
}

export interface PageDataWithContent extends PageData {
  content: ComponentConfig[];
}

export interface PageOption {
  id?: string;
  scene?: string;
  from?: string;
  path?: string;
  action?: string;
}
