import type {
  TitleComponentOptions,
  TextComponentOptions,
  ImageComponentOptions,
  FooterComponentOptions,
  DocComponentOptions,
  PhoneComponentOptions,
  SwiperComponentOptions,
  MediaComponentOptions,
  CardComponentOptions,
  CopyComponentOptions,
  LoadingComponentOptions,
  IntroComponentOptions,
  AdvancedListComponentOptions,
  ButtonListComponnetItemOptions,
  GridComponentItemOptions,
  GridComponentOptions,
  ListComponentItemOptions,
  ListComponentOptions,
  NaviagatorListComponentItemOptions,
  SwitchListComponentItemOptions,
  SliderListComponentItemOptions,
  PickerListComponentItemOptions,
} from "../server/typings";

export interface GridComponentItemConfig extends GridComponentItemOptions {
  /** Base64 icon 路径 */
  base64Icon?: string;
}

export interface GridComponentConfig extends GridComponentOptions {
  content: GridComponentItemConfig[];
}

export interface ListComponentItemConfig extends ListComponentItemOptions {
  /** Base64 icon 路径 */
  base64Icon?: string;
}

export interface ListComponentConfig extends ListComponentOptions {
  content: ListComponentItemConfig[];
}

export interface SwitchListComponentItemConfig
  extends SwitchListComponentItemOptions {
  /** 开关状态 */
  status?: boolean;
}

export interface SliderListComponentItemConfig<T = unknown>
  extends SliderListComponentItemOptions {
  /** 滑块对应的值*/
  value?: T;
  /** 是否显示滑块 */
  visible?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface PickerListComponentItemConfig<T = any>
  extends PickerListComponentItemOptions<T> {
  /** 是否显示选择器 */
  visible?: boolean;
  /** picker 选择器对应的键 */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  currentValue?: T extends any[] ? number[] : number;
}

export interface ButtonListComponnetItemConfig
  extends ButtonListComponnetItemOptions {
  /**
   * 是否禁用按钮
   *
   * @default false
   */
  disabled?: boolean;
}

export type AdvancedListComponentItemConfig =
  | ListComponentItemOptions
  | NaviagatorListComponentItemOptions
  | SwitchListComponentItemConfig
  | PickerListComponentItemConfig
  | SliderListComponentItemConfig
  | ButtonListComponnetItemConfig;

export interface AdvancedListComponentConfig
  extends AdvancedListComponentOptions {
  /** 列表内容 */
  content: AdvancedListComponentItemConfig[];
}

export type ComponentConfig = (
  | TitleComponentOptions
  | TextComponentOptions
  | ImageComponentOptions
  | ListComponentConfig
  | AdvancedListComponentConfig
  | GridComponentConfig
  | FooterComponentOptions
  | DocComponentOptions
  | PhoneComponentOptions
  | SwiperComponentOptions
  | MediaComponentOptions
  | CardComponentOptions
  | CopyComponentOptions
  | LoadingComponentOptions
  | IntroComponentOptions
) & {
  /**
   * 是否隐藏
   *
   * @default false
   */
  hidden?: boolean;
};
