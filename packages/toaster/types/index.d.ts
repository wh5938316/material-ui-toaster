import { ToastProps } from '../src/Toast';
import { ToasterProps } from '../src/Toaster';
import { ToastClassKey } from '../src/toastClasses';
import { ToasterClassKey } from '../src/toasterClasses';
import {
  ComponentsOverrides,
  ComponentsVariants,
  Theme as MuiTheme,
} from '@mui/material/styles';

type Theme = Omit<MuiTheme, 'components'>;

declare module '@mui/material/styles' {
  interface ComponentsPropsList {
    MuiToast: Partial<ToastProps>;
    MuiToaster: Partial<ToasterProps>;
  }

  interface ComponentNameToClassKey {
    MuiToast: ToastClassKey;
    MuiToaster: ToasterClassKey;
  }

  interface Components {
    MuiToast?: {
      defaultProps?: ComponentsPropsList['MuiToast'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiToast'];
      variants?: ComponentsVariants['MuiToast'];
    };
    MuiToaster?: {
      defaultProps?: ComponentsPropsList['MuiToaster'];
      styleOverrides?: ComponentsOverrides<Theme>['MuiToaster'];
      variants?: ComponentsVariants['MuiToaster'];
    };
  }
}
