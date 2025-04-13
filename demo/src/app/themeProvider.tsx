'use client';

import { defaultTheme, theme } from './theme';
import { Box, FormControlLabel, Switch } from '@mui/material';
import DefaultPropsProvider from '@mui/material/DefaultPropsProvider';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { useState } from 'react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [useCustomTheme, setUseCustomTheme] = useState(true);

  return (
    <DefaultPropsProvider
      value={{
        MuiTextField: {
          slotProps: {
            inputLabel: {
              shrink: true,
            },
          },
        },
      }}
    >
      <MuiThemeProvider theme={useCustomTheme ? theme : defaultTheme}>
        {/* <Box sx={{ position: 'fixed', top: 20, right: 20, zIndex: 1300 }}>
          <FormControlLabel
            control={
              <Switch
                checked={useCustomTheme}
                onChange={(e) => setUseCustomTheme(e.target.checked)}
                color="primary"
              />
            }
            label={useCustomTheme ? 'Custom Style' : 'Default Style'}
          />
        </Box> */}
        {children}
      </MuiThemeProvider>
    </DefaultPropsProvider>
  );
}
