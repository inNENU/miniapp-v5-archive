import $register = require("wxpage");
import {
  AdvancedListComponentConfig,
  AdvancedListComponentItemConfig,
  ButtonListComponnetItemConfig,
  PickerListComponentItemConfig,
  SliderListComponentItemConfig,
  SwitchListComponentItemConfig,
} from "../../../../typings";
import { readFile } from "../../../utils/file";

interface ListDetail<T = AdvancedListComponentItemConfig> {
  id: string;
  content: T;
}

$register.C<{
  config: AdvancedListComponentConfig;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  change: Record<string, any>;
}>({
  properties: {
    /** 配置 */
    config: { type: Object },

    /** 改变触发 */
    change: { type: Object },
  },

  methods: {
    /** 控制选择器显隐 */
    pickerTap(event: WechatMiniprogram.TouchEvent): void {
      const {
        id,
        content: { visible: value },
      } = this.getDetail(event) as ListDetail<PickerListComponentItemConfig>;

      this.setData({ [`config.content[${id}].visible`]: !value });
    },

    /** 控制选择器改变 */
    pickerChange(event: WechatMiniprogram.PickerChange): void {
      const { id, content } = this.getDetail(event) as ListDetail<
        PickerListComponentItemConfig
      >;

      if (event.type === "change") {
        const { value } = event.detail;

        // 判断为多列选择器，遍历每一列更新页面数据、并存储选择器值
        if (Array.isArray(value)) {
          value.forEach((x: string | number, y: number) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (content.value as any[])[y] = (content.pickerValue as any[][])[y][
              Number(x)
            ];
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            (content.currentValue as number[])![y] = Number(x);
          });
          wx.setStorageSync(content.key, value.join("-"));

          // 判断为单列选择器，更新页面数据并存储选择器值
        } else {
          content.value = content.pickerValue[Number(value)];
          content.currentValue = Number(value);
          wx.setStorageSync(content.key, Number(value));
        }

        // 将选择器的变更响应到页面上
        this.setData({ [`config.content[${id}]`]: content }, () => {
          this.triggerEvent("change", { value, event: content.picker });
        });
      }
    },

    /** 开关改变 */
    switch(event: WechatMiniprogram.SwitchChange): void {
      const { id, content } = this.getDetail(event) as ListDetail<
        SwitchListComponentItemConfig
      >;

      // 更新页面数据
      this.setData(
        { [`config.content[${id}].status`]: event.detail.value },
        () => {
          this.triggerEvent("change", {
            event: content.Switch,
            value: event.detail.value,
          });
        }
      );

      wx.setStorageSync(content.swiKey, event.detail.value); // 将开关值写入存储的swiKey变量中
    },

    /** 触发按钮事件 */
    button(event: WechatMiniprogram.TouchEvent): void {
      const { content } = this.getDetail(event) as ListDetail<
        ButtonListComponnetItemConfig
      >;

      this.triggerEvent("change", { event: content.button });
    },

    /** 控制滑块显隐 */
    sliderTap(event: WechatMiniprogram.TouchEvent): void {
      const { id, content } = this.getDetail(event) as ListDetail<
        SliderListComponentItemConfig
      >;

      // 更新页面数据
      this.setData({ [`config.content[${id}].visible`]: !content.visible });
    },

    /** 滑块改变 */
    sliderChange(event: WechatMiniprogram.SliderChange): void {
      const { id, content } = this.getDetail(event) as ListDetail<
        SliderListComponentItemConfig
      >;
      const { value } = event.detail;

      // 更新页面数据，并写入值到存储
      content.value = value;

      // 写入页面数据
      this.setData({ [`config.content[${id}].value`]: value }, () => {
        this.triggerEvent("change", { value, event: content.slider });
      });

      if (event.type === "change") wx.setStorageSync(content.sliKey, value);
    },

    /** 获得选择器位置与内容 */
    getDetail({ currentTarget }: WechatMiniprogram.BaseEvent): ListDetail {
      const id = currentTarget.id || currentTarget.dataset.id;

      return {
        id,
        content: (this.data.config as AdvancedListComponentConfig).content[
          Number(id)
        ],
      };
    },
  },

  observers: {
    "config.content"(value: AdvancedListComponentItemConfig[]): void {
      // 设置图标
      this.setData({
        icons: value.map((item) =>
          "base64Icon" in item ? readFile(`icon/${item.base64Icon}`) || "" : ""
        ),
      });
    },

    /**
     * 改变触发
     *
     * @param detail 需要改变的键及其对应值
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    change(detail: Record<string, any>): void {
      if (detail) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const detail2: Record<string, any> = {};

        Object.keys(detail).forEach((element) => {
          detail2[`config.${element}`] = detail[element];
        });

        this.setData(detail2);
      }
    },
  },
});
