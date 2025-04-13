'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import DownloadIcon from '@mui/icons-material/Download';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Toaster, ToasterPosition, toaster } from 'material-ui-toaster';
import * as React from 'react';

// Simulate async operation
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default function ToasterDemo() {
  const [position, setPosition] = React.useState<ToasterPosition>('bottom-right');
  const [expand, setExpand] = React.useState<boolean>(false);
  const [duration, setDuration] = React.useState<number>(5000);

  // Show a notification
  const showToast = (type?: 'info' | 'success' | 'warning' | 'error' | 'default') => {
    const message = `This is a ${getTypeText(type)} notification`;
    const description =
      'This is the notification description text, which can contain more details.';

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

  // Show notification with custom icon
  const showCustomIconToast = () => {
    toaster.info('This is a notification with custom icon', {
      icon: <PhotoCamera color="primary" />,
      description: 'You can customize the icon for any type of notification.',
    });
  };

  // Show notification with action button
  const showActionToast = () => {
    toaster.action(
      'Are you sure you want to delete this file?',
      'Delete',
      async () => {
        // Simulate delete operation
        await wait(2000);
        // No need to return anything, action method will automatically handle success state
      },
      {
        type: 'default',
        description: 'This action cannot be undone.',
        success: 'File has been successfully deleted!',
        error: 'Delete failed, please try again',
      },
    );
  };

  // Show Promise-based notification
  const showPromiseToast = () => {
    // Simulate file upload
    const uploadPromise = new Promise<{ fileName: string; fileSize: string }>((resolve, reject) => {
      // 50% chance of success, 50% chance of failure
      setTimeout(() => {
        if (Math.random() > 0.5) {
          console.log('Upload successful');
          resolve({ fileName: 'document.pdf', fileSize: '2.4MB' });
        } else {
          console.log('Upload failed');
          reject(new Error('Network connection timeout'));
        }
      }, 3000);
    });

    // Directly pass Promise instance, note the parameter order is message, promise, options
    toaster.promise('Uploading file...', uploadPromise, {
      success: (data) => `File ${data.fileName} (${data.fileSize}) uploaded successfully`,
      error: (err) => `Upload failed: ${err.message}`,
    });
  };

  // Show notification with custom content
  const showCustomToast = () => {
    const CustomContent = (
      <Box sx={{ bgcolor: 'background.paper' }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          New Message Notification
        </Typography>
        {/* <Divider sx={{ my: 1 }} /> */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          You have 3 unread messages and 2 new tasks to handle.
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" variant="text">
            Ignore
          </Button>
          <Button size="small" variant="contained">
            View Details
          </Button>
        </Stack>
      </Box>
    );

    toaster.custom(CustomContent, { duration: 8000 });
  };

  // Handle duration change
  const handleDurationChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setDuration(value);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Toaster position={position} expand={expand} duration={duration} />
      <Typography variant="h4" gutterBottom>
        Toaster Component Demo
      </Typography>

      <Typography variant="h6" gutterBottom>
        Basic Notification Types
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant="contained" onClick={() => showToast('default')}>
          Default
        </Button>
        <Button variant="contained" color="info" onClick={() => showToast('info')}>
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
      </Stack>

      <Typography variant="h6" gutterBottom>
        Advanced Notification Features
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant="outlined" onClick={showCustomIconToast} startIcon={<PhotoCamera />}>
          Custom Icon
        </Button>
        <Button
          variant="outlined"
          color="warning"
          onClick={showActionToast}
          startIcon={<DeleteIcon />}
        >
          Action Button
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={showPromiseToast}
          startIcon={<DownloadIcon />}
        >
          Promise Toast
        </Button>
        <Button variant="outlined" color="secondary" onClick={showCustomToast}>
          Custom Content
        </Button>
      </Stack>

      <Typography variant="h6" gutterBottom>
        Notification Position
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
        <Button
          variant={position === 'top-left' ? 'contained' : 'outlined'}
          onClick={() => setPosition('top-left')}
        >
          Top Left
        </Button>
        <Button
          variant={position === 'top-center' ? 'contained' : 'outlined'}
          onClick={() => setPosition('top-center')}
        >
          Top Center
        </Button>
        <Button
          variant={position === 'top-right' ? 'contained' : 'outlined'}
          onClick={() => setPosition('top-right')}
        >
          Top Right
        </Button>
        <Button
          variant={position === 'bottom-left' ? 'contained' : 'outlined'}
          onClick={() => setPosition('bottom-left')}
        >
          Bottom Left
        </Button>
        <Button
          variant={position === 'bottom-center' ? 'contained' : 'outlined'}
          onClick={() => setPosition('bottom-center')}
        >
          Bottom Center
        </Button>
        <Button
          variant={position === 'bottom-right' ? 'contained' : 'outlined'}
          onClick={() => setPosition('bottom-right')}
        >
          Bottom Right
        </Button>
      </Stack>

      <Typography variant="h6" gutterBottom>
        Display Mode
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant={expand ? 'contained' : 'outlined'} onClick={() => setExpand(true)}>
          Expanded Mode
        </Button>
        <Button variant={!expand ? 'contained' : 'outlined'} onClick={() => setExpand(false)}>
          Stacked Mode
        </Button>
      </Stack>

      <Typography variant="h6" gutterBottom>
        Display Duration
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <TextField
          type="number"
          value={duration}
          onChange={handleDurationChange}
          size="small"
          variant="outlined"
          slotProps={{
            input: {
              endAdornment: <InputAdornment position="end">ms</InputAdornment>,
            },
          }}
        />
      </Stack>

      <Typography variant="h6" gutterBottom>
        Other Operations
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button variant="outlined" onClick={() => toaster.clear()}>
          Clear All Notifications
        </Button>
        <Button
          variant="outlined"
          onClick={() => {
            const id = toaster.toast({
              message: 'This notification will last for 10 seconds',
              description: 'Unless you close it manually',
              duration: 10000,
            });
            console.log('Notification ID:', id);
          }}
        >
          Long Duration Toast
        </Button>
      </Stack>
    </div>
  );
}
