import {
  unstable_generateUtilityClass as generateUtilityClass,
  unstable_generateUtilityClasses as generateUtilityClasses,
} from '@mui/utils';

export interface ToasterClasses {
  /** Applied to the root element */
  root: string;
  /** Applied to the container element */
  container: string;
  /** Applied to the root element with position top-left */
  positionTopLeft: string;
  /** Applied to the root element with position top-right */
  positionTopRight: string;
  /** Applied to the root element with position top-center */
  positionTopCenter: string;
  /** Applied to the root element with position bottom-left */
  positionBottomLeft: string;
  /** Applied to the root element with position bottom-right */
  positionBottomRight: string;
  /** Applied to the root element with position bottom-center */
  positionBottomCenter: string;
  /** Applied to the root element in expanded state */
  expanded: string;
}

export type ToasterClassKey = keyof ToasterClasses;

// Generate utility classes with prefix 'MuiToaster'
export function getToasterUtilityClass(slot: string) {
  return generateUtilityClass('MuiToaster', slot);
}

// Generate all class names based on ToasterClasses interface
export const toasterClasses: ToasterClasses = generateUtilityClasses('MuiToaster', [
  'root',
  'container',
  'positionTopLeft',
  'positionTopRight',
  'positionTopCenter',
  'positionBottomLeft',
  'positionBottomRight',
  'positionBottomCenter',
  'expanded',
]);
