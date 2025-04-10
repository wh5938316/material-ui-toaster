'use client';

import { switchClasses } from '@mui/material';
import { buttonClasses } from '@mui/material/Button';
import { svgIconClasses } from '@mui/material/SvgIcon';
import { amber, blue, deepPurple, green, grey, red } from '@mui/material/colors';
import { alpha, createTheme } from '@mui/material/styles';
import { toastClasses, toasterClasses } from 'material-ui-toaster';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const brand = deepPurple;

const theme = createTheme({
  colorSchemes: { light: true },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  components: {
    MuiFormControlLabel: {
      styleOverrides: {
        root: {
          marginLeft: 0,
          gap: 12,
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          width: 32,
          height: 20,
          padding: 0,
          display: 'flex',
          '&:active': {
            [`& .${switchClasses.thumb}`]: {
              width: 19,
            },
            [`& .${switchClasses.switchBase}.Mui-checked`]: {
              transform: 'translateX(9px)',
            },
          },
        },
        switchBase: {
          padding: 2,
          '&.Mui-checked': {
            transform: 'translateX(12px)',
            color: '#fff',
            [`& + .${switchClasses.track}`]: {
              opacity: 1,
              backgroundColor: brand[500],
            },
          },
        },
        thumb: ({ theme }) => ({
          boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
          width: 16,
          height: 16,
          borderRadius: 8,
          transition: theme.transitions.create('width', {
            duration: 200,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
          }),
        }),
        track: {
          borderRadius: 20 / 2,
          opacity: 1,
          backgroundColor: 'rgba(0, 0, 0, .25)',
          boxSizing: 'border-box',
        },
      },
    },
    MuiButtonBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxSizing: 'border-box',
          transition: 'all 100ms ease-in',
          '&:focus-visible': {
            outline: `3px solid ${alpha(theme.palette.primary.main, 0.5)}`,
            outlineOffset: '2px',
          },
        }),
      },
    },
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: 'none',
          borderRadius: theme.shape.borderRadius,
          textTransform: 'none',
          [`& .${svgIconClasses.root}`]: {
            fill: 'currentColor',
          },
          variants: [
            {
              props: {
                size: 'small',
              },
              style: {
                height: '2rem',
                padding: '8px 12px',
                fontWeight: 600,
                [`& .${svgIconClasses.root}`]: {
                  fontSize: '1rem',
                },
              },
            },
            {
              props: {
                size: 'medium',
              },
              style: {
                fontWeight: 700,
                height: '2.25rem', // 40px
              },
            },
            {
              props: {
                color: 'primary',
                variant: 'contained',
              },
              style: {
                color: 'white',
                backgroundColor: brand[800],
                // backgroundImage: `linear-gradient(to bottom, ${brand[700]}, ${brand[800]})`,
                // boxShadow: `inset 0 1px 0 ${brand[600]}, inset 0 -1px 0 1px hsl(220, 0%, 0%)`,
                [`&:not(.${buttonClasses.disabled})`]: {
                  border: `1px solid ${brand[700]}`,
                },
                '&:hover': {
                  backgroundImage: 'none',
                  backgroundColor: brand[700],
                  boxShadow: 'none',
                },
                '&:active': {
                  backgroundColor: brand[900],
                },
                ...theme.applyStyles('dark', {
                  color: 'black',
                  backgroundColor: grey[50],
                  // backgroundImage: `linear-gradient(to bottom, ${grey[100]}, ${grey[50]})`,
                  boxShadow: 'inset 0 -1px 0  hsl(220, 30%, 80%)',
                  border: `1px solid ${grey[50]}`,
                  '&:hover': {
                    backgroundImage: 'none',
                    backgroundColor: grey[300],
                    boxShadow: 'none',
                  },
                  '&:active': {
                    backgroundColor: grey[400],
                  },
                }),
              },
            },
            {
              props: {
                variant: 'outlined',
              },
              style: {
                color: theme.palette.text.primary,
                border: '1px solid',
                borderColor: grey[200],
                backgroundColor: alpha(grey[50], 0.3),
                '&:hover': {
                  backgroundColor: grey[100],
                  borderColor: grey[300],
                },
                '&:active': {
                  backgroundColor: grey[200],
                },
                ...theme.applyStyles('dark', {
                  backgroundColor: grey[800],
                  borderColor: grey[700],

                  '&:hover': {
                    backgroundColor: grey[900],
                    borderColor: grey[600],
                  },
                  '&:active': {
                    backgroundColor: grey[900],
                  },
                }),
              },
            },
            {
              props: {
                color: 'secondary',
                variant: 'outlined',
              },
              style: {
                color: brand[700],
                border: '1px solid',
                borderColor: brand[200],
                backgroundColor: brand[50],
                '&:hover': {
                  backgroundColor: brand[100],
                  borderColor: brand[400],
                },
                '&:active': {
                  backgroundColor: alpha(brand[200], 0.7),
                },
                ...theme.applyStyles('dark', {
                  color: brand[50],
                  border: '1px solid',
                  borderColor: brand[900],
                  backgroundColor: alpha(brand[900], 0.3),
                  '&:hover': {
                    borderColor: brand[700],
                    backgroundColor: alpha(brand[900], 0.6),
                  },
                  '&:active': {
                    backgroundColor: alpha(brand[900], 0.5),
                  },
                }),
              },
            },
            {
              props: {
                variant: 'text',
              },
              style: {
                color: grey[600],
                '&:hover': {
                  backgroundColor: grey[100],
                },
                '&:active': {
                  backgroundColor: grey[200],
                },
                ...theme.applyStyles('dark', {
                  color: grey[50],
                  '&:hover': {
                    backgroundColor: grey[700],
                  },
                  '&:active': {
                    backgroundColor: alpha(grey[700], 0.7),
                  },
                }),
              },
            },
            {
              props: {
                color: 'secondary',
                variant: 'text',
              },
              style: {
                color: brand[700],
                '&:hover': {
                  backgroundColor: alpha(brand[100], 0.5),
                },
                '&:active': {
                  backgroundColor: alpha(brand[200], 0.7),
                },
                ...theme.applyStyles('dark', {
                  color: brand[100],
                  '&:hover': {
                    backgroundColor: alpha(brand[900], 0.5),
                  },
                  '&:active': {
                    backgroundColor: alpha(brand[900], 0.3),
                  },
                }),
              },
            },
            {
              props: {
                variant: 'text',
                size: 'small',
              },
              style: {
                paddingLeft: 12,
                paddingRight: 12,
              },
            },
            {
              props: {
                variant: 'text',
                size: 'medium',
              },
              style: {
                paddingLeft: 16,
                paddingRight: 16,
              },
            },
            {
              props: {
                variant: 'soft',
                color: 'primary',
              },
              style: {
                color: brand[700],
                backgroundColor: alpha(brand[100], 0.5),
                '&:hover': {
                  backgroundColor: alpha(brand[200], 0.5),
                },
                '&:active': {
                  color: brand[800],
                  backgroundColor: alpha(brand[200], 0.9),
                },
                [`&.${buttonClasses.disabled}`]: {
                  backgroundColor: alpha(grey[100], 0.5),
                },
                ...theme.applyStyles('dark', {
                  color: brand[100],
                  backgroundColor: alpha(brand[800], 0.5),
                  '&:hover': {
                    backgroundColor: alpha(brand[800], 0.7),
                  },
                  '&:active': {
                    backgroundColor: alpha(brand[800], 0.5),
                  },
                }),
              },
            },
          ],
        }),
      },
    },
    // 自定义 Toast 组件样式
    MuiToast: {
      styleOverrides: {
        root: ({ theme }) => ({
          // 自定义成功类型样式
          [`&.${toastClasses.typeSuccess} .${toastClasses.content}`]: {
            borderColor: green[100],
            [`& .${toastClasses.closeButton}`]: {
              borderColor: green[100],
            },
          },
          [`&.${toastClasses.typeInfo} .${toastClasses.content}`]: {
            borderColor: blue[100],
            [`& .${toastClasses.closeButton}`]: {
              borderColor: blue[100],
            },
          },
          [`&.${toastClasses.typeWarning} .${toastClasses.content}`]: {
            borderColor: amber[100],
            [`& .${toastClasses.closeButton}`]: {
              borderColor: amber[100],
            },
          },
          [`&.${toastClasses.typeError} .${toastClasses.content}`]: {
            borderColor: red[100],
            [`& .${toastClasses.closeButton}`]: {
              borderColor: red[100],
            },
          },
          // 添加边框
          '& .MuiToast-content': {
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: theme.shape.borderRadius + 2,
          },
        }),
        content: ({ theme }) => ({
          border: '1px solid',
          backgroundColor: theme.palette.background.paper,
          borderColor: theme.palette.divider,
          boxShadow: '0 4px 12px rgba(0,0,0,.1)',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,.1)',
          },
        }),
        closeButton: ({ theme }) => ({
          left: -10,
          top: -10,
          width: 20,
          height: 20,
          color: 'inherit',
          borderRadius: '50%',
          backgroundColor: theme.palette.background.paper,
          border: '1px solid',
          borderColor: theme.palette.divider,
          transition: theme.transitions.create('opacity', {
            duration: 350,
            easing: theme.transitions.easing.easeInOut,
          }),
          display: 'none',
          opacity: 0,
          [`& .${svgIconClasses.root}`]: {
            fontSize: 12,
            fill: 'currentColor',
          },
          '&:hover': {
            backgroundColor: theme.palette.background.paper,
          },
        }),
      },
    },
    // 自定义 Toaster 组件样式
    MuiToaster: {
      styleOverrides: {
        root: ({ theme }) => ({
          // 增加间距
          [`&.${toasterClasses.positionBottomRight}`]: {
            bottom: 32,
            right: 32,
          },
          '&:hover': {
            [`& .${toastClasses.closeButton}`]: {
              display: 'flex',
            },
          },
          [`&.${toasterClasses.hovered} .${toastClasses.closeButton}`]: {
            opacity: 1,
          },
        }),
      },
    },
  },
});

const defaultTheme = createTheme({
  colorSchemes: { light: true },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
});

export { theme, defaultTheme };
