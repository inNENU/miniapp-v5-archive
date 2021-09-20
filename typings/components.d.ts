import type {
  AccountComponentOptions,
  CardComponentOptions,
  ButtonListComponnetItemOptions,
  CarouselComponentOptions,
  CopyComponentOptions,
  DocComponentOptions,
  FooterComponentOptions,
  FunctionalListComponentOptions,
  GridComponentItemOptions,
  GridComponentOptions,
  ImageComponentOptions,
  ListComponentItemOptions,
  ListComponentOptions,
  LoadingComponentOptions,
  MediaComponentOptions,
  NaviagatorListComponentItemOptions,
  PickerListComponentItemOptions,
  PhoneComponentOptions,
  SwitchListComponentItemOptions,
  SliderListComponentItemOptions,
  TextComponentOptions,
  TitleComponentOptions,
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

export type FunctionalListComponentItemConfig =
  | ListComponentItemOptions
  | NaviagatorListComponentItemOptions
  | SwitchListComponentItemConfig
  | PickerListComponentItemConfig
  | SliderListComponentItemConfig
  | ButtonListComponnetItemConfig;

export interface FunctionalListComponentConfig
  extends FunctionalListComponentOptions {
  /** 列表内容 */
  content: FunctionalListComponentItemConfig[];
}

export type ComponentConfig = (
  | AccountComponentOptions
  | CardComponentOptions
  | CarouselComponentOptions
  | CopyComponentOptions
  | DocComponentOptions
  | FooterComponentOptions
  | FunctionalListComponentConfig
  | GridComponentConfig
  | ImageComponentOptions
  | ListComponentConfig
  | LoadingComponentOptions
  | MediaComponentOptions
  | PhoneComponentOptions
  | TextComponentOptions
  | TitleComponentOptions
) & {
  /**
   * 是否隐藏
   *
   * @default false
   */
  hidden?: boolean;
};
