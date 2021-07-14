import { logger } from "@mptool/enhance";
import { server } from "./config";
import { dirname, readJSON, exists, rm, mkdir } from "@mptool/file";

/** 用户文件夹路径 */
const userPath = wx.env.USER_DATA_PATH;

export interface SaveJSONOption {
  url: string;
  path?: string;
  success?: () => void;
  fail?: (errMsg: string | number) => void;
  error?: (statusCode: number) => void;
}

export const saveJSON = ({
  url,
  path = url,
  success,
  fail,
  error: errorFunc = fail,
}: SaveJSONOption): void => {
  mkdir(dirname(path));

  wx.downloadFile({
    url: `${server}${url}.json`,
    filePath: `${userPath}/${path}.json`,
    success: (res) => {
      if (res.statusCode === 200) {
        logger.info(`Save ${url}.json success`);
        if (success) success();
      } else {
        logger.error(
          `Get ${url}.json failed with status code ${res.statusCode}`
        );
        if (errorFunc) errorFunc(res.statusCode);
      }
    },
    fail: ({ errMsg }) => {
      logger.error(`Download ${url}.json failed with error: ${errMsg}`);
      if (fail) fail(errMsg);
    },
  });
};

export interface EnsureJSONOption {
  path: string;
  url?: string;
  success?: () => void;
  fail?: (errMsg: string | number) => void;
  error?: (statusCode: number) => void;
}

export const ensureJSON = ({
  path,
  url = path,
  success,
  fail,
  error: errorFunc = fail,
}: EnsureJSONOption): void => {
  if (!exists(`${path}.json`)) {
    logger.info(`Fetching ${url}.json`);

    mkdir(dirname(path));

    wx.downloadFile({
      url: `${server}${url}.json`,
      filePath: `${userPath}/${path}.json`,
      success: (res) => {
        if (res.statusCode === 200) {
          logger.info(`Fetch ${url}.json success`);
          if (success) success();
        } else {
          logger.error(
            `Fetch ${url}.json failed with statuscode ${res.statusCode}`
          );
          if (errorFunc) errorFunc(res.statusCode);
          rm(`${path}.json`);
        }
      },
      fail: ({ errMsg }) => {
        logger.error(`Download ${url}.json failed with error ${errMsg}`);
        if (fail) fail(errMsg);
      },
    });
  } else if (success) success();
};

export interface GetJSONOption<T> {
  path: string;
  url?: string;
  success?: (data: T) => void;
  fail?: (errMsg?: string | number) => void;
  error?: (statusCode: number) => void;
}

/**
 * 获取 JSON
 *
 * @param path JSON 文件路径
 * @param successFunc JSON 获取成功后的回调
 * @param failFunc JSON 获取失败后的回调
 */
export const getJSON = <T>({
  path,
  url = path,
  success,
  fail,
  error: errorFunc = fail,
}: GetJSONOption<T>): void => {
  ensureJSON({
    url,
    path,
    success: () => {
      const data = readJSON<T>(path);

      if (success && typeof data !== "undefined") success(data);
      else if (fail) fail("Data returned with undefined");
    },
    fail,
    error: errorFunc,
  });
};
