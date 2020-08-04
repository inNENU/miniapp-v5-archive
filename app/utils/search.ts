import { getJSON } from "./file";
import { SearchInfo } from "../../typings";

/** 搜索权重 */
interface SearchResultWeight {
  [jsonName: string]: number;
}

/** 搜索结果 */
interface SearchResult {
  /** 地址 */
  url: string;
  /** 文字 */
  text: string;
  /** 详情 */
  desc?: string;
}

interface WordInfo {
  text: string;
  weight: number;
}

const genWords = (word: string): WordInfo[] => {
  const { length } = word;

  if (length === 1) return [{ text: word, weight: 1 }];
  const result: WordInfo[] = [];
  for (let wordNumber = 2; wordNumber <= length; wordNumber++)
    for (let start = 0; start < length - wordNumber + 1; start++)
      result.push({
        text: word.slice(start, start + wordNumber),
        weight: wordNumber,
      });

  console.log(result);

  return result;
};

/**
 * 搜索词
 *
 * @param searchWord 输入的搜索词
 *
 * @returns 匹配的候选词列表
 */
export const searching = (
  searchWord: string,
  callback: (words: string[]) => void
): void => {
  const words: string[] = [];

  getJSON({
    path: "guide/search",
    url: "resource/guide/search",
    success: (data) => {
      const keywords = data as SearchInfo;

      if (searchWord)
        Object.keys(keywords).forEach((jsonName) => {
          const { title } = keywords[jsonName];

          // 检查标题是否包含了 searchWord
          if (
            title &&
            title.indexOf(searchWord) !== -1 &&
            words.indexOf(title) === -1
          )
            words.push(title);

          // 检查每个关键词是否包含了 searchWord
          if (keywords[jsonName].keywords)
            keywords[jsonName].keywords.forEach((keyword) => {
              if (
                keyword.indexOf(searchWord) !== -1 &&
                words.indexOf(keyword) === -1
              )
                words.push(keyword);
            });

          // 检查描述是否包含了 searchWord
          if (keywords[jsonName].desc)
            keywords[jsonName].desc.forEach((keyword) => {
              if (
                keyword.indexOf(searchWord) !== -1 &&
                words.indexOf(keyword) === -1
              )
                words.push(keyword);
            });
        });

      callback(words);
    },
  });
};

/**
 * 搜索
 *
 * @param searchWord 输入的搜索词
 *
 * @returns 匹配的结果列表
 */
// eslint-disable-next-line max-lines-per-function
export const search = (
  searchWord: string,
  callback: (result: SearchResult[]) => void
): void => {
  const wordsInfo = genWords(searchWord);
  const weight: SearchResultWeight = {};
  const desc: Record<string, any> = {};

  getJSON({
    path: "guide/search",
    url: "resource/guide/search",
    success: (data) => {
      const searchMap = data as SearchInfo;

      Object.keys(searchMap).forEach((pageID) => {
        // 搜索页面标题，权重为 6
        wordsInfo.forEach((word) => {
          const { title } = searchMap[pageID];

          if (title && title.indexOf(word.text) !== -1)
            weight[pageID] = (weight[pageID] || 0) + 6 * word.weight;
        });

        if (searchMap[pageID].keywords)
          // 搜索关键词，权重为 4
          searchMap[pageID].keywords.forEach((keyword) => {
            wordsInfo.forEach((word) => {
              if (keyword.indexOf(word.text) !== -1)
                weight[pageID] = (weight[pageID] || 0) + 4 * word.weight;
            });
          });

        const descConfig: SearchResultWeight = {};

        if (searchMap[pageID].desc)
          // 搜索段落标题，权重为 2
          searchMap[pageID].desc.forEach((descText) => {
            wordsInfo.forEach((word) => {
              if (descText.indexOf(word.text) !== -1) {
                weight[pageID] = (weight[pageID] || 0) + 2 * word.weight;
                descConfig[descText] = Math.max(
                  descConfig[descText],
                  word.weight
                );
              }
            });
          });

        desc[pageID] = Object.keys(descConfig)
          .sort((x, y) => (descConfig[y] = descConfig[x]))
          .shift();

        if (searchMap[pageID].text)
          // 搜索文字，权重为 1
          searchMap[pageID].text.forEach((text: string) => {
            wordsInfo.forEach((word) => {
              if (text.indexOf(word.text) !== -1)
                weight[pageID] = (weight[pageID] || 0) + 1 * word.weight;
            });
          });
      });

      const result = Object.keys(weight)
        // 按权重排序
        .sort((x, y) => weight[y] - weight[x])
        .map((key) => ({
          url: `page?id=${key}&from=搜索`,
          text: searchMap[key].title,
          desc: desc[key],
        }));

      callback(result);
    },
  });
};
