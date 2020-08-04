declare namespace WX {
  interface RequestResult<T>
    extends WechatMiniprogram.RequestSuccessCallbackResult {
    data: T;
  }
}
