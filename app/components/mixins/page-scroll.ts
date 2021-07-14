type Scroller = (event: WechatMiniprogram.Page.IPageScrollOption) => void;
type TrivialInstance = WechatMiniprogram.Page.TrivialInstance & {
  scrollHandler?: Scroller[];
};

const getCurrentPage = (): TrivialInstance => {
  const pages = getCurrentPages();

  return pages[pages.length - 1];
};

const onPageScroll = (
  event: WechatMiniprogram.Page.IPageScrollOption
): void => {
  const { scrollHandler = [] } = getCurrentPage();

  scrollHandler.forEach((scroller) => {
    if (typeof scroller === "function") scroller(event);
  });
};

export const pageScrollMixin = (scroller: Scroller): string =>
  Behavior({
    attached() {
      const page = getCurrentPage();

      if (Array.isArray(page.scrollHandler))
        page.scrollHandler.push(scroller.bind(this));
      else
        page.scrollHandler =
          typeof page.onPageScroll === "function"
            ? [page.onPageScroll.bind(page), scroller.bind(this)]
            : [scroller.bind(this)];

      page.onPageScroll = onPageScroll as (
        arg?: WechatMiniprogram.Page.IPageScrollOption
      ) => void;
    },

    detached() {
      const page = getCurrentPage();

      page.scrollHandler = (page.scrollHandler || []).filter(
        (item) => item !== scroller
      );
    },
  });
