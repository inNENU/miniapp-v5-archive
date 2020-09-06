import { PageConfigWithContent } from "../../../typings";

export default {
  title: "功能大厅",
  grey: true,
  hidden: true,
  content: [
    {
      tag: "card",
      type: "page",
      src: "http://mp.innenu.com/img/tab/map.jpg",
      title: "校园地图",
      logo: "map",
      url: "map",
    },
    {
      tag: "card",
      type: "page",
      src: "http://mp.innenu.com/img/tab/headphone.jpg",
      title: "音悦东师",
      logo: "music",
      url: "music",
    },
    {
      tag: "card",
      type: "page",
      src: "http://mp.innenu.com/img/tab/calendar.jpg",
      title: "校历",
      logo: "calendar",
      url: "calendar",
    },
    {
      tag: "card",
      type: "page",
      src: "http://mp.innenu.com/img/tab/sport-field.jpg",
      title: "体测计算器",
      logo: "calculate",
      url: "PEcal",
    },
    {
      tag: "card",
      type: "page",
      src: "http://mp.innenu.com/img/tab/wechat.jpg",
      title: "校园公众号",
      logo: "wechat",
      url: "wechat",
    },
  ],
} as PageConfigWithContent;
