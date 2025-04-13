'use client';

import { Button, Stack } from '@mui/material';
import { toaster } from 'material-ui-toaster';
import React from 'react';

const ToastDemo = () => {
  // Basic toast examples
  const showToast = (type?: 'info' | 'success' | 'warning' | 'error' | 'default') => {
    const message = `This is a ${getTypeText(type)} notification`;
    const description = 'This is the notification description text';

    if (type && type !== 'default') {
      toaster[type](message, { description });
    } else {
      toaster.toast({ message, description, type });
    }
  };

  // Get type text
  const getTypeText = (type?: string) => {
    switch (type) {
      case 'info':
        return 'information';
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      case 'error':
        return 'error';
      default:
        return 'default';
    }
  };

  // Custom action toast
  const showActionToast = () => {
    toaster.action(
      'Delete this file?',
      'Delete',
      async () => {
        // Simulate delete operation
        await new Promise((resolve) => setTimeout(resolve, 1000));
      },
      {
        type: 'default',
        description: 'This action cannot be undone.',
        success: 'File has been deleted!',
        error: 'Delete failed, please try again',
      },
    );
  };

  return (
    <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 4, flexWrap: 'wrap', gap: 1 }}>
      <Button variant="contained" color="primary" onClick={() => showToast('info')}>
        Info
      </Button>
      <Button variant="contained" color="success" onClick={() => showToast('success')}>
        Success
      </Button>
      <Button variant="contained" color="warning" onClick={() => showToast('warning')}>
        Warning
      </Button>
      <Button variant="contained" color="error" onClick={() => showToast('error')}>
        Error
      </Button>
      <Button variant="outlined" onClick={showActionToast}>
        Action Toast
      </Button>
    </Stack>
  );
};

export default ToastDemo;
