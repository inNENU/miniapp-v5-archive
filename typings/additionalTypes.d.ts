declare namespace WechatMiniprogram {
  interface RequestResult<T> extends RequestSuccessCallbackResult {
    data: T;
  }
}
