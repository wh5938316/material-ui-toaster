import { atom } from 'jotai';
import { ToasterPosition } from 'material-ui-toaster';

// Define atoms for Toaster configuration
export const toasterPositionAtom = atom<ToasterPosition>('bottom-right');
export const toasterExpandAtom = atom<boolean>(false);
