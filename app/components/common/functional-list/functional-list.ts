import { $Component } from "@mptool/enhance";
import { readFile } from "@mptool/file";

import type { PropType } from "@mptool/enhance";
import type {
  FunctionalListComponentConfig,
  FunctionalListComponentItemOptions,
  PickerListComponentItemConfig,
  SliderListComponentItemConfig,
  SwitchListComponentItemConfig,
} from "../../../../typings";

interface ListDetail<T = FunctionalListComponentItemOptions> {
  id: string;
  content: T;
}

$Component({
  properties: {
    /** 配置 */
    config: {
      type: Object as PropType<FunctionalListComponentConfig>,
      required: true,
    },
  },

  methods: {
    /** 控制选择器显隐 */
    onPickerTap(
      event: WechatMiniprogram.TouchEvent<
        Record<string, never>,
        Record<string, never>,
        { id: string }
      >
    ): void {
      const {
        id,
        content: { visible: value },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      } = this.getDetail(event) as ListDetail<PickerListComponentItemConfig>;

      this.setData({ [`config.content[${id}].visible`]: !value });
    },

    /** 控制选择器改变 */
    onPickerChange(
      event: WechatMiniprogram.PickerChange<
        Record<string, never>,
        { id: string }
      >
    ): void {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const { id, content } = this.getDetail(
        event
      ) as ListDetail<PickerListComponentItemConfig>;

      if (event.type === "change") {
        const { value } = event.detail;

        // 判断为多列选择器，遍历每一列更新页面数据、并存储选择器值
        if (Array.isArray(value)) {
          value.forEach((x: string | number, y: number) => {
            // eslint-disable-next-line
            (content.value as any[])[y] = (content.select as any[][])[y][
              Number(x)
            ];
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (content.currentValue as number[])![y] = Number(x);
          });
          wx.setStorageSync(content.key, value.join("-"));

          // 判断为单列选择器，更新页面数据并存储选择器值
        } else {
          // eslint-disable-next-line
          content.value = content.select[Number(value)];
          content.currentValue = Number(value);
          wx.setStorageSync(content.key, Number(value));
        }

        // 将选择器的变更响应到页面上
        this.setData({ [`config.content[${id}]`]: content }, () => {
          if (content.handler) this.$call(content.handler, value);
        });
      }
    },

    /** 开关改变 */
    onToggleSwitch(
      event: WechatMiniprogram.SwitchChange<
        Record<string, never>,
        { id: string }
      >
    ): void {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const { id, content } = this.getDetail(
        event
      ) as ListDetail<SwitchListComponentItemConfig>;

      // 更新页面数据
      this.setData(
        { [`config.content[${id}].status`]: event.detail.value },
        () => {
          if (content.handler) this.$call(content.handler, event.detail.value);
        }
      );

      // 将开关值写入存储的 key 变量中
      wx.setStorageSync(content.key, event.detail.value);
    },

    /** 控制滑块显隐 */
    onSliderTap(
      event: WechatMiniprogram.PickerChange<
        Record<string, never>,
        { id: string }
      >
    ): void {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const { id, content } = this.getDetail(
        event
      ) as ListDetail<SliderListComponentItemConfig>;

      // 更新页面数据
      this.setData({ [`config.content[${id}].visible`]: !content.visible });
    },

    /** 滑块改变 */
    sliderChange(
      event: WechatMiniprogram.SliderChange<
        Record<string, never>,
        { id: string }
      >
    ): void {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      const { id, content } = this.getDetail(
        event
      ) as ListDetail<SliderListComponentItemConfig>;
      const { value } = event.detail;

      // 更新页面数据，并写入值到存储
      content.value = value;

      // 写入页面数据
      this.setData({ [`config.content[${id}].value`]: value }, () => {
        if (content.handler) this.$call(content.handler, value);
      });

      if (event.type === "change") wx.setStorageSync(content.key, value);
    },

    /** 获得选择器位置与内容 */
    getDetail({
      currentTarget,
    }: WechatMiniprogram.CustomEvent<
      Record<string, unknown>,
      Record<string, unknown>,
      { id: string } & Record<string, unknown>
    >): ListDetail {
      const id = currentTarget.id || currentTarget.dataset.id;

      return {
        id,
        content: this.data.config.content[Number(id)],
      };
    },
    // 设置图标
    setLogo(content?: FunctionalListComponentItemOptions[]) {
      this.setData({
        icons: (content || this.data.config.content).map((item) =>
          item.icon && !item.icon.includes("/")
            ? readFile(`icon/${item.icon}`) || ""
            : ""
        ),
      });
    },
  },

  lifetimes: {
    attached() {
      this.setLogo = this.setLogo.bind(this);
      this.$emitter.on("inited", this.setLogo);
    },

    detached() {
      this.$emitter.off("inited", this.setLogo);
    },
  },

  observers: {
    "config.content"(value: FunctionalListComponentItemOptions[]): void {
      this.setLogo(value);
    },
  },
});
