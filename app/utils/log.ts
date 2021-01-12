/** 实时日志管理器 */
const log = wx.getRealtimeLogManager
  ? wx.getRealtimeLogManager()
  : wx.getLogManager({ level: 1 });
const hasRealtime = "getRealtimeLogManager" in wx;

/** 写入普通日志 */
export const debug = (...args: any[]): void => {
  console.log(...args);
  if (hasRealtime) log.info("debug", ...args);
  else (log as WechatMiniprogram.LogManager).debug(...args);
};

/** 写入信息日志 */
export const info = (...args: any[]): void => {
  console.info(...args);
  log.info(...args);
};

/** 写入警告日志 */
export const warn = (...args: any[]): void => {
  console.warn(...args);
  log.warn(...args);
};

/** 写入错误日志 */
export const error = (...args: any[]): void => {
  console.error(...args);
  if (hasRealtime) (log as WechatMiniprogram.RealtimeLogManager).error(...args);
  else log.warn("error", ...args);
};

/**
 * 写入过滤信息
 *
 * @param filterMsg 过滤信息
 */
export const fliter = (filterMsg: string): void => {
  if (hasRealtime)
    (log as WechatMiniprogram.RealtimeLogManager).setFilterMsg(filterMsg);
};
