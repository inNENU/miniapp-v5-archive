/* eslint-disable max-lines */
import { debug, error, info, warn } from "./log";
import { ensureJSON, readJSON, writeJSON } from "./file";
import { modal, requestJSON } from "./wx";
import { AppOption } from "../app";
import { Notice } from "./app";
import { PageOption, PageConfig } from "../../typings/pageData";

/** 全局数据 */
const { globalData } = getApp<AppOption>();

/**
 * 处理列表
 *
 * @param element 列表的内容
 * @param page 页面内容
 */
const resolveList = (listElement: any, page: PageConfig): void => {
  // 设置列表导航
  if ("url" in listElement) listElement.url += `?from=${page.title}`;
  if ("path" in listElement)
    listElement.url = `page?from=${page.title}&id=${listElement.path}`;

  // 设置列表开关与滑块
  if ("swiKey" in listElement)
    listElement.status = wx.getStorageSync(listElement.swiKey);
  if ("sliKey" in listElement)
    listElement.value = wx.getStorageSync(listElement.sliKey);

  // 设置列表选择器
  if ("pickerValue" in listElement)
    if (listElement.single) {
      // 单列选择器
      const pickerValue: string | number = wx.getStorageSync(listElement.key);

      listElement.value = listElement.pickerValue[pickerValue];
      listElement.currentValue = [pickerValue];
    } else {
      // 多列选择器
      const pickerValues: string[] = wx
        .getStorageSync(listElement.key)
        .split("-");

      listElement.currentValue = [];
      listElement.value = [];
      pickerValues.forEach((pickerElement, index) => {
        listElement.value[index] =
          listElement.pickerValue[index][Number(pickerElement)];
        listElement.currentValue[index] = Number(pickerElement);
      });
    }
};

/**
 * 获得界面数据，生成正确的界面数据
 *
 * @param page 页面数据
 * @param option 页面传参
 * @param firstPage 是否是第一个页面
 *
 * @returns 处理之后的page
 */
const disposePage = (
  page: PageConfig,
  option: PageOption,
  firstOpen = false
): PageConfig => {
  if (page) {
    page.statusBarHeight = globalData.info.statusBarHeight;

    // 判断是否是首页或来自分享
    if (firstOpen || option.scene || option.action == "redirect") {
      // 左上角动作默认为重定向
      page.from = "主页";
      if (typeof page.action === "undefined") page.action = "redirect";
      info(`${page.id} 页面由分享载入`);
    } else {
      page.id = option.id ? option.id : page.title; // 设置界面名称
      page.from = option.from || "返回"; // 设置页面来源
    }

    if (page.content)
      page.content.forEach((element) => {
        // 设置list组件
        if ("content" in element)
          element.content.forEach((listElement: any) =>
            resolveList(listElement, page)
          );
      });

    // 调试
    info(`${page.id} 处理完毕`);
  }
  // 调试: 未传入 page
  else error("页面数据不存在");

  return page; // 返回处理后的 page
};

/**
 * 提前获得子界面。在界面加载完毕时，检查界面包含的所有链接是否已存在本地 json，如果没有立即获取并处理后写入存储
 *
 * @param page 页面数据
 */
const preGetPage = (page: PageConfig): void => {
  if (page && page.content)
    page.content.forEach((component) => {
      if ("content" in component)
        // 该组件是列表，需要预加载界面，提前获取界面到存储
        component.content.forEach((element: any) => {
          if ("path" in element)
            ensureJSON({
              path: `guide/${element.path}`,
              url: `resource/guide/${element.path}`,
            });
        });
    });
  else warn("不存在页面内容");

  wx.reportMonitor("1", 1); // 统计报告
};

/**
 * **简介:**
 *
 * - 描述: 预处理页面数据写入全局数据
 *
 * - 用法: 在页面 `onNavigate` 时调用
 *
 * - 性质: 同步函数
 *
 * @param option 页面跳转参数
 * @param page page 数组
 * @param setGlobal 是否将处理后的数据写入到全局数据中
 *
 * @returns 处理后的 page 配置
 *
 * **案例:**
 *
 * ```ts
 *   onNavigate(option) {
 *     resolvePage(option);
 *   }
 * ```
 */
export const resolvePage = (
  option: MPPage.PageLifeTimeOptions,
  page?: PageConfig,
  setGlobal = true
): PageConfig | null => {
  info("将要跳转: ", option); // 控制台输出参数
  let pageData = null;

  if (page) pageData = disposePage(page, option.query);
  else if (option.query.id) {
    const jsonContent: PageConfig = readJSON(`guide/${option.query.id}`);

    if (jsonContent) pageData = disposePage(jsonContent, option.query);
    else warn(`${option.query.id} 文件不存在，处理失败`);
  }

  if (pageData && setGlobal) {
    // 写入 globalData
    globalData.page.id = option.query.id || pageData.title;
    globalData.page.data = pageData;
  }

  return pageData;
};

export interface ColorConfig {
  bgColor: string;
  bgColorTop: string;
  bgColorBottom: string;
}

/**
 * **简介:**
 *
 * - 描述: 设置胶囊与背景颜色
 *
 * - 用法: 在页面 `onShow` 时调用
 *
 * - 性质: 同步函数
 *
 * @param grey 页面是否为灰色背景
 *
 * @returns 页面实际的胶囊与背景颜色
 */
export const getColor = (grey = false): ColorConfig => {
  let temp;

  if (globalData.darkmode && grey)
    switch (globalData.theme) {
      case "Andriod":
        temp = ["#10110b", "#10110b", "#10110b"];
        break;
      case "iOS":
        temp = ["#000000", "#000000", "#000000"];
        break;
      case "NENU":
      default:
        temp = ["#070707", "#070707", "#070707"];
    }
  else if (globalData.darkmode && !grey)
    switch (globalData.theme) {
      case "iOS":
        temp = ["#000000", "#000000", "#000000"];
        break;
      case "Andriod":
      case "NENU":
      default:
        temp = ["#000000", "#000000", "#000000"];
    }
  else if (!globalData.darkmode && grey)
    switch (globalData.theme) {
      case "Andriod":
        temp = ["#f8f8f8", "#f8f8f8", "#f8f8f8"];
        break;
      case "NENU":
        temp = ["#f0f0f0", "#f0f0f0", "#f0f0f0"];
        break;
      case "iOS":
      default:
        temp = ["#f4f4f4", "#efeef4", "#efeef4"];
    }
  else
    switch (globalData.theme) {
      case "Andriod":
        temp = ["#f8f8f8", "#f8f8f8", "#f8f8f8"];
        break;
      case "NENU":
        temp = ["#ffffff", "#ffffff", "#ffffff"];
        break;
      case "iOS":
      default:
        temp = ["#f4f4f4", "#ffffff", "#ffffff"];
    }

  return {
    bgColorTop: temp[0],
    bgColor: temp[1],
    bgColorBottom: temp[2],
  };
};

interface SetPageOption {
  option: PageOption;
  ctx: WechatMiniprogram.Page.MPInstance<
    Record<string, any>,
    Record<string, any>
  >;
  handle?: boolean;
}

/**
 *  **简介:**
 *
 * - 描述: 设置本地界面数据，如果传入 `page` 参数，则根据 `handle` 的值决定是否在 `setData` 前处理 `page`。
 * 如果没有传入 `page`，则使用 `PageOption.data.page`。之后根据 `preload` 的值决定是否对页面链接进行预加载。
 *
 * - 用法: 在页面 `onLoad` 时调用
 *
 * - 性质: 同步函数
 *
 * @param object 配置对象
 * - option 页面传参
 * - ctx 页面指针
 * - handle 页面是否已经被处理
 * @param page 页面数据
 * @param preload 是否预加载子页面
 */
export const setPage = (
  { option, ctx, handle = false }: SetPageOption,
  page?: PageConfig,
  preload = true
): void => {
  // 设置页面数据
  if (page) {
    const pageData = handle
      ? page
      : disposePage(page, option, ctx.$state.firstOpen);

    ctx.setData({
      color: getColor(pageData.grey),
      theme: globalData.theme,
      darkmode: globalData.darkmode,
      page: pageData,
    });
  }
  // 页面已经预处理完毕，立即写入 page 并执行本界面的预加载
  else if (
    (option.id && globalData.page.id === option.id) ||
    (ctx.data.page && globalData.page.id === ctx.data.page.title)
  ) {
    debug(`${globalData.page.id} 已处理`);
    ctx.setData(
      {
        color: getColor(globalData.page.data?.grey),
        theme: globalData.theme,
        darkmode: globalData.darkmode,
        page: globalData.page.data,
      },
      () => {
        debug(`${globalData.page.id} 已写入`);
        if (preload) {
          preGetPage(ctx.data.page);
          debug(`${globalData.page.id} 预加载子页面完成`);
        }
      }
    );
  } else {
    debug(`${option.id || "未知页面"} 未处理`);
    const pageData = handle
      ? ctx.data.page
      : disposePage(ctx.data.page, option, ctx.$state.firstOpen);

    // 设置页面数据
    ctx.setData({
      color: getColor(pageData.grey),
      theme: globalData.theme,
      darkmode: globalData.darkmode,
      page: pageData,
    });
  }
};

/**
 * **简介:**
 *
 * - 描述: 弹出通知
 *
 * - 用法: 在页面 `onLoad` 时调用
 *
 * - 性质: 同步函数
 *
 * @param id 当前界面的标识符
 */
export const popNotice = (id: string): void => {
  if (!wx.getStorageSync(`${id}-notifyed`)) {
    // 没有进行过通知，判断是否需要弹窗，从存储中获取通知内容并展示
    const notice: Notice = wx.getStorageSync(`${id}-notice`);

    if (notice) {
      modal(notice.title, notice.content, () => {
        wx.setStorageSync(`${id}notifyed`, true); // 防止二次弹窗
      });
      info(`${id} 页面弹出通知`); // 调试
    }
  }
  wx.reportAnalytics("page_count", { id }); // Aim统计分析
};

/**
 * **简介:**
 *
 * - 描述: 设置在线界面数据
 *
 * - 用法: 在页面 `onLoad` 时调用
 *
 * - 性质: 同步函数
 *
 * @param option 页面传参
 * @param ctx 页面指针
 * @param preload 是否需要预加载(默认需要)
 */
// eslint-disable-next-line max-lines-per-function
export const setOnlinePage = (
  option: PageOption,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  ctx: any,
  preload = true
): void => {
  // 页面已经预处理完毕，立即写入 page 并执行本界面的预加载
  if (globalData.page.id === option.id) {
    debug(`${option.id} 已处理`);
    ctx.setData(
      {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        color: getColor(globalData.page.data!.grey),
        theme: globalData.theme,
        darkmode: globalData.darkmode,
        page: globalData.page.data,
      },
      () => {
        debug(`${option.id} 已写入`);
        if (preload) {
          preGetPage(ctx.data.page);
          debug(`${option.id} 预加载子页面完成`);
        }
      }
    );
  } else if (option.id) {
    // 需要重新载入界面
    info(`${option.id} onLoad开始，参数为: `, option);
    const page = readJSON(`guide/${option.id}`);

    // 如果本地存储中含有 page 直接处理
    if (page) {
      setPage({ option, ctx }, page);
      popNotice(option.id);
      info(`${option.id} onLoad 成功: `, ctx.data);
      wx.reportMonitor("0", 1);

      // 如果需要执行预加载，则执行
      if (preload) {
        preGetPage(ctx.data.page);
        debug(`${option.id} 界面预加载完成`);
      }
    }
    // 请求页面Json
    else
      requestJSON(
        `resource/guide/${option.id}`,
        (data) => {
          // 非分享界面下将页面数据写入存储
          if (option.from !== "share") writeJSON(`guide/${option.id}`, data);

          // 设置界面
          setPage({ option, ctx }, data as PageConfig);

          // 如果需要执行预加载，则执行
          if (preload) {
            preGetPage(ctx.data.page);
            debug(`${option.id} 界面预加载完成`);
          }

          // 弹出通知
          popNotice(option.id || "");

          // 调试
          info(`${option.id} onLoad 成功`);
        },
        (res) => {
          // 设置 error 页面并弹出通知
          setPage(
            { option, ctx },
            {
              error: true,
              statusBarHeight: globalData.info.statusBarHeight,
            }
          );
          popNotice(option.id || "");

          // 调试
          warn(`${option.id} onLoad 失败，错误为`, res);
        },
        () => {
          // 设置 error 界面
          setPage(
            { option, ctx },
            {
              error: true,
              statusBarHeight: globalData.info.statusBarHeight,
            }
          );

          // 调试
          warn(`${option.id} 资源错误`);
        }
      );
  } else error("no id");
};

/**
 * **简介:**
 *
 * - 描述: 载入在线界面数据
 *
 * - 用法: 在页面 `onLoad` 时调用
 *
 * - 性质: 同步函数
 *
 * @param option 页面传参
 * @param ctx 页面指针
 * @param preload 是否需要预加载(默认需要)
 */
// eslint-disable-next-line max-lines-per-function
export const loadOnlinePage = (
  option: PageOption & { path: string },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  ctx: any
): void => {
  if (option.path) {
    // 需要重新载入界面
    info(`${option.path} onLoad 开始，参数为:`, option);
    requestJSON(
      `resource/${option.path}`,
      (page) => {
        if (page) {
          setPage({ option, ctx }, page as PageConfig);
          popNotice(option.path);
          info(`${option.path} onLoad 成功:`, ctx.data);
          wx.reportMonitor("0", 1);
        }
      },
      (errMsg) => {
        // 设置 error 页面并弹出通知
        setPage(
          { option, ctx },
          {
            error: true,
            statusBarHeight: globalData.info.statusBarHeight,
          }
        );
        popNotice(option.path || "");

        // 调试
        warn(`${option.path} onLoad 失败，错误为 ${errMsg}`);
      }
    );
  } else error("no path");
};

/**
 * 加载字体
 *
 * @param theme 主题
 */
export const loadFont = (theme: string): void => {
  if (theme === "Android")
    wx.loadFontFace({
      family: "FZKTJW",
      source: 'url("https://v3.mp.innenu.com/fonts/FZKTJW.ttf")',
      complete: (res) => {
        info("楷体字体", res); // 调试
      },
    });
  else if (theme === "NENU")
    wx.loadFontFace({
      family: "FZSSJW",
      source: 'url("https://v3.mp.innenu.com/fonts/FZSSJW.ttf")',
      complete: (res) => {
        info("宋体字体", res); // 调试
      },
    });
  else warn(`无法处理主题 ${theme}`);
};

/**
 * **简介:**
 *
 * - 描述: 导航栏动态改变
 *
 * - 用法: 在页面 `onPageScroll` 时调用
 *
 * - 性质: 同步函数
 *
 * @param option 组件参数
 * @param ctx 页面指针
 * @param headName 导航栏配置对象在 `data` 中的名称
 *
 * **案例:**
 *
 * ```ts
 *   onPageScroll(event) {
 *     changeNav(event, this);
 *   },
 * ```
 */
export const changeNav = (
  option: WechatMiniprogram.Page.IPageScrollOption,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  ctx: any,
  headName?: string
): void => {
  const pageHead = headName ? ctx.data[headName] : ctx.data.page;

  // 判断情况并赋值
  const nav = {
    borderDisplay: option.scrollTop >= 53,
    titleDisplay: option.scrollTop > 42,
    shadow: option.scrollTop > 1,
  };

  // 判断结果并更新界面数据
  if (pageHead.titleDisplay !== nav.titleDisplay)
    ctx.setData({
      [`${headName || "page"}.titleDisplay`]: nav.titleDisplay,
    });
  else if (pageHead.borderDisplay !== nav.borderDisplay)
    ctx.setData({
      [`${headName || "page"}.borderDisplay`]: nav.borderDisplay,
    });
  else if (pageHead.shadow !== nav.shadow)
    ctx.setData({ [`${headName || "page"}.shadow`]: nav.shadow });
};
