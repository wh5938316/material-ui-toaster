'use client';

import { type Theme, createTheme } from '@mui/material/styles';
import { Roboto } from 'next/font/google';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  colorSchemes: { light: true },
  cssVariables: {
    colorSchemeSelector: 'class',
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: ({ theme }) => ({
          variants: [
            {
              props: { severity: 'info' },
              style: {
                backgroundColor: '#60a5fa',
              },
            },
          ],
        }),
      },
    },
    // 自定义 Toast 组件样式
    // MuiToast: {
    //   styleOverrides: {
    //     root: ({ theme }) => ({
    //       // 自定义成功类型样式
    //       '&.MuiToast-typeSuccess .MuiToast-content': {
    //         backgroundColor: theme.palette.success.main,
    //         color: theme.palette.success.contrastText,
    //       },
    //       // 自定义信息类型样式
    //       '&.MuiToast-typeInfo .MuiToast-content': {
    //         backgroundColor: theme.palette.info.main,
    //         color: theme.palette.info.contrastText,
    //       },
    //       // 添加边框
    //       '& .MuiToast-content': {
    //         border: `1px solid ${theme.palette.divider}`,
    //         borderRadius: theme.shape.borderRadius + 2,
    //       },
    //     }),
    //   },
    // },
    // // 自定义 Toaster 组件样式
    // MuiToaster: {
    //   styleOverrides: {
    //     root: ({ theme }) => ({
    //       // 增加间距
    //       '&.MuiToaster-positionBottomRight': {
    //         bottom: 32,
    //         right: 32,
    //       },
    //     }),
    //   },
    // },
  },
});

export default theme;
