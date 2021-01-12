import { SearchInfo } from "../../typings";
import { requestJSON } from "./wx";

/** 搜索匹配详情 */
interface SearchContentDetail {
  type: "title" | "heading" | "text" | "card" | "doc";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [props: string]: any;
}

/** 搜索内容 */
interface SearchContent {
  /** 权重 */
  weight: number;
  /** 搜索内容 */
  content: SearchContentDetail[];
}

/** 搜索结果 */
export interface SearchResult {
  /** 页面标题 */
  title: string;
  /** 页面标识 */
  id: string;
  /** 搜索内容 */
  content?: SearchContentDetail[];
}

interface WordInfo {
  text: string;
  weight: number;
}

/**
 * 生成匹配词
 *
 * @param word 搜索词
 */
const genWords = (word: string): WordInfo[] => {
  const { length } = word;

  if (length === 1) return [{ text: word, weight: 1 }];
  const result: WordInfo[] = [];

  for (let wordNumber = length; wordNumber > 1; wordNumber--)
    for (let start = 0; start < length - wordNumber + 1; start++)
      result.push({
        text: word.slice(start, start + wordNumber),
        weight: wordNumber,
      });

  return result;
};

/**
 * 搜索词
 *
 * @param searchWord 输入的搜索词
 * @param category 搜索分类
 *
 * @returns 匹配的候选词列表
 */
export const searching = (
  searchWord: string,
  category: string,
  callback: (words: string[]) => void
): void => {
  const words: string[] = [];

  requestJSON(`resource/${category}-search`, (data) => {
    const keywords = data as SearchInfo;

    if (searchWord)
      Object.keys(keywords).forEach((jsonName) => {
        const { name = "", desc = "", title, heading } = keywords[jsonName];

        // 检查标题是否包含了 searchWord
        if (name.indexOf(searchWord) !== -1 && words.indexOf(name) === -1)
          words.push(name);

        // 检查描述是否包含了 searchWord
        if (desc.indexOf(searchWord) !== -1 && desc.indexOf(name) === -1)
          words.push(name);

        // 检查大标题是否包含了 searchWord
        title.forEach((keyword) => {
          if (
            keyword.indexOf(searchWord) !== -1 &&
            words.indexOf(keyword) === -1
          )
            words.push(keyword);
        });

        // 检查小标题是否包含了 searchWord
        heading.forEach((keyword) => {
          if (
            keyword.indexOf(searchWord) !== -1 &&
            words.indexOf(keyword) === -1
          )
            words.push(keyword);
        });
      });

    callback(words);
  });
};

/**
 * 搜索
 *
 * @param searchWord 输入的搜索词
 * @param category 搜索分类
 *
 * @returns 匹配的结果列表
 */
// eslint-disable-next-line max-lines-per-function
export const search = (
  searchWord: string,
  category: string,
  callback: (result: SearchResult[]) => void
): void => {
  const wordsInfo = genWords(searchWord);
  const result: Record<string, SearchContent> = {};

  // eslint-disable-next-line max-lines-per-function
  requestJSON(`resource/${category}-search`, (data) => {
    const searchMap = data as SearchInfo;

    // eslint-disable-next-line
    Object.keys(searchMap).forEach((pageID) => {
      let weight = 0;
      const matchList: SearchContentDetail[] = [];
      const {
        name = "",
        desc = "",
        title,
        heading,
        card,
        doc,
        text,
      } = searchMap[pageID];

      for (let i = 0; i < wordsInfo.length; i++) {
        const word = wordsInfo[i];

        // 搜索页面标题，权重为 8
        if (name.indexOf(word.text) !== -1) weight += 8 * word.weight;

        // 搜索页面描述，权重为 4
        if (desc.indexOf(word.text) !== -1) {
          weight += 4 * word.weight;
          matchList.push({
            type: "text",
            text: desc,
          });
        }

        // 搜索大标题，权重为 4
        title.forEach((text) => {
          if (text.indexOf(word.text) !== -1) {
            weight += 4 * word.weight;
            matchList.push({ type: "title", text });
          }
        });

        // 搜索段落标题，权重为 2
        heading.forEach((text) => {
          if (text.indexOf(word.text) !== -1) {
            weight += 2 * word.weight;
            matchList.push({ type: "heading", text });
          }
        });

        // 搜索文档，权重为 2
        doc.forEach((config) => {
          const { name, icon } = config;

          if (name.indexOf(word.text) !== -1) {
            weight += 2 * word.weight;
            matchList.push({ type: "doc", name, icon });
          }
        });

        if (matchList.length >= 3) {
          result[pageID] = { weight, content: matchList };
          break;
        }

        // 搜索卡片，权重为 2
        card.forEach((config) => {
          const { title, desc = "" } = config;

          if (title.indexOf(word.text) !== -1) {
            weight += 4 * word.weight;
            matchList.push({ type: "card", title, desc });
          } else if (desc.indexOf(word.text) !== -1) {
            weight += 2 * word.weight;
            matchList.push({ type: "card", title, desc });
          }
        });

        // 搜索文字，权重为 1
        text.forEach((text) => {
          const index = text.indexOf(word.text);

          if (index !== -1) {
            weight += 1 * word.weight;

            const startIndex = Math.max(0, index - 8);
            const endIndex = Math.min(
              index + 8 + word.text.length,
              text.length
            );

            matchList.push({
              type: "text",
              text: `${startIndex === 0 ? "" : "..."}${text.substring(
                startIndex,
                endIndex
              )}${endIndex === text.length ? "" : "..."}`,
            });
          }
        });

        if (weight > 0) {
          result[pageID] = { weight, content: matchList };
          break;
        }
      }
    });

    const searchResult = Object.keys(result)
      // 按权重排序
      .sort((x, y) => result[y].weight - result[x].weight)
      .map((id) => ({
        title: searchMap[id].name,
        content: result[id].content,
        id,
      }));

    callback(searchResult);
  });
};
