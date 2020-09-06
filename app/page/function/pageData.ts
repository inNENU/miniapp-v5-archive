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
      base64Logo: "map",
      url: "map",
    },
    {
      tag: "card",
      type: "page",
      src: "http://mp.innenu.com/img/tab/headphone.jpg",
      title: "音悦东师",
      base64Logo: "music",
      url: "music",
    },
    {
      tag: "card",
      type: "page",
      src: "http://mp.innenu.com/img/tab/calendar.jpg",
      title: "校历",
      base64Logo: "calendar",
      url: "calendar",
    },
    {
      tag: "card",
      type: "page",
      src: "http://mp.innenu.com/img/tab/sport-field.jpg",
      title: "体测计算器",
      base64Logo: "calculate",
      url: "PEcal",
    },
    {
      tag: "card",
      type: "page",
      src: "http://mp.innenu.com/img/tab/wechat.jpg",
      title: "校园公众号",
      base64Logo: "wechat",
      url: "wechat",
    },
  ],
} as PageConfigWithContent;
