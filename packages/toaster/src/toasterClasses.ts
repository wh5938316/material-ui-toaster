import {
  unstable_generateUtilityClass as generateUtilityClass,
  unstable_generateUtilityClasses as generateUtilityClasses,
} from '@mui/utils';

export interface ToasterClasses {
  /** 应用于根元素 */
  root: string;
  /** 应用于容器元素 */
  container: string;
  /** 应用于位置为top-left的根元素 */
  positionTopLeft: string;
  /** 应用于位置为top-right的根元素 */
  positionTopRight: string;
  /** 应用于位置为bottom-left的根元素 */
  positionBottomLeft: string;
  /** 应用于位置为bottom-right的根元素 */
  positionBottomRight: string;
  /** 应用于展开状态的根元素 */
  expanded: string;
}

export type ToasterClassKey = keyof ToasterClasses;

// 生成类名前缀为'MuiToaster'的工具类
export function getToasterUtilityClass(slot: string) {
  return generateUtilityClass('MuiToaster', slot);
}

// 根据ToasterClasses接口生成所有类名
export const toasterClasses: ToasterClasses = generateUtilityClasses('MuiToaster', [
  'root',
  'container',
  'positionTopLeft',
  'positionTopRight',
  'positionBottomLeft',
  'positionBottomRight',
  'expanded',
]);
