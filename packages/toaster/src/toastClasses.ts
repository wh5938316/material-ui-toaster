import {
  unstable_generateUtilityClass as generateUtilityClass,
  unstable_generateUtilityClasses as generateUtilityClasses,
} from '@mui/utils';

export interface ToastClasses {
  /** Applied to the root element */
  root: string;
  /** Applied to the content element */
  content: string;
  /** Applied to the message element */
  message: string;
  /** Applied to the description element */
  description: string;
  /** Applied to the close button */
  closeButton: string;
  /** Applied to the icon container */
  iconContainer: string;
  /** Applied to the action button */
  actionButton: string;
  /** Applied to the content area (icon and text) */
  contentArea: string;
  /** Applied to the text area */
  textArea: string;
  /** Applied to custom content */
  customContent: string;
  /** Applied to info type Toast */
  typeInfo: string;
  /** Applied to success type Toast */
  typeSuccess: string;
  /** Applied to warning type Toast */
  typeWarning: string;
  /** Applied to error type Toast */
  typeError: string;
  /** Applied to default type Toast */
  typeDefault: string;
  /** Applied to newly created Toast */
  new: string;
  /** Applied to Toast being deleted */
  deleting: string;
  /** Applied to Promise type Toast in loading state */
  promisePending: string;
  /** Applied to successful Promise type Toast */
  promiseFulfilled: string;
  /** Applied to failed Promise type Toast */
  promiseRejected: string;
  /** Applied to action button in loading state */
  actionLoading: string;
  /** Applied to the first Toast in stack */
  first: string;
}

export type ToastClassKey = keyof ToastClasses;

// Generate utility classes with prefix 'MuiToast'
export function getToastUtilityClass(slot: string) {
  return generateUtilityClass('MuiToast', slot);
}

// Generate all class names based on ToastClasses interface
export const toastClasses: ToastClasses = generateUtilityClasses('MuiToast', [
  'root',
  'content',
  'message',
  'description',
  'closeButton',
  'iconContainer',
  'actionButton',
  'contentArea',
  'textArea',
  'customContent',
  'typeInfo',
  'typeSuccess',
  'typeWarning',
  'typeError',
  'typeDefault',
  'new',
  'deleting',
  'promisePending',
  'promiseFulfilled',
  'promiseRejected',
  'actionLoading',
  'first',
]);
