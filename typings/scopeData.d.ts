export interface GeneralScopeData {
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "@type": "general";
  /**
   * 内容标识
   *
   * appid下全局唯一，长度不大于256字符
   */
  // eslint-disable-next-line @typescript-eslint/naming-convention
  uniq_id: string;
  /**
   * 内容标题
   *
   * 该页面内容的主题，不超过100个字符
   */
  title: string;
  /**
   * 内容缩略图
   *
   * 该页面包含图片或者能描述该页面的图片URL，宽高比1: 1，建议500x500px，不超过10张
   */
  thumbs: string[];
  /**
   * 内容封面大图
   *
   * 能描述该页面的封面大图URL，适用于需要大图表现的内容(如视频)，宽高比16: 9，宽度不低于800px，限定1张
   */
  cover?: string;
  /**
   * 内容摘要
   *
   * 该页面的摘要内容，不超过200个字符
   */
  digest: string;
  /**
   * 内容关键词
   *
   * 能描述该页面的关键词，不超过10个，每个关键词不超过10个字符
   */
  tags: string[];
}
