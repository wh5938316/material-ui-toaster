'use client';

import { toasterExpandAtom, toasterPositionAtom } from './atoms';
import { Box, Paper, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { useAtom } from 'jotai';
import React from 'react';

const ToastConfig = () => {
  const [position, setPosition] = useAtom(toasterPositionAtom);
  const [expand, setExpand] = useAtom(toasterExpandAtom);

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle1" gutterBottom>
          Position
        </Typography>
        <ToggleButtonGroup
          value={position}
          exclusive
          onChange={(e, newPosition) => newPosition && setPosition(newPosition)}
          size="small"
          sx={{ flexWrap: 'wrap', mb: 3 }}
        >
          <ToggleButton value="top-left">Top Left</ToggleButton>
          <ToggleButton value="top-center">Top Center</ToggleButton>
          <ToggleButton value="top-right">Top Right</ToggleButton>
          <ToggleButton value="bottom-left">Bottom Left</ToggleButton>
          <ToggleButton value="bottom-center">Bottom Center</ToggleButton>
          <ToggleButton value="bottom-right">Bottom Right</ToggleButton>
        </ToggleButtonGroup>

        <Typography variant="subtitle1" gutterBottom>
          Display Mode
        </Typography>
        <ToggleButtonGroup
          value={expand ? 'expanded' : 'stacked'}
          exclusive
          onChange={(e, mode) => mode && setExpand(mode === 'expanded')}
          size="small"
          sx={{ mb: 3 }}
        >
          <ToggleButton value="stacked">Stacked</ToggleButton>
          <ToggleButton value="expanded">Expanded</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </>
  );
};

export default ToastConfig;
