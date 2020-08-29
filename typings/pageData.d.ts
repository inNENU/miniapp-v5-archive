import { PageConfig as PageDataConfig } from "../server/typings";

export * from "../server/typings";

declare namespace PageData {
  enum PageDataOption {
    "tag",
    "head",
    "foot",
    "content",
  }

  interface List {
    tag: "list";
    head: string | boolean;
    content: any[];
    foot?: string;
  }
  type Test = List[];
}

/** 页面数据 */
export interface PageConfig extends Partial<PageDataConfig> {
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
}

export interface PageOption {
  id?: string;
  scene?: string;
  from?: string;
  path?: string;
  action?: string;
}
