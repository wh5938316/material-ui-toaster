# material-ui-toaster

[![npm version](https://img.shields.io/npm/v/material-ui-toaster.svg)](https://www.npmjs.com/package/material-ui-toaster)
[![npm downloads](https://img.shields.io/npm/dm/material-ui-toaster.svg)](https://www.npmjs.com/package/material-ui-toaster)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A modern, customizable toast notification system for Material UI applications. This library is
inspired by the animations of Sonner, but built with Material UI components and fully integrated
with the MUI theme system.

## Features

- 🎨 Fully compatible with MUI theme system
- 🚀 Smooth animations and transitions
- 📱 Responsive design
- 🧩 Multiple notification types (success, error, info, warning)
- 🔄 Promise-based notifications
- 👆 Action buttons support
- 🔧 Highly customizable

## Installation

```bash
npm install material-ui-toaster
```

or

```bash
yarn add material-ui-toaster
```

## TypeScript Setup

If you're using TypeScript and want to customize the toaster through the MUI theme, add this
reference to your project's `.d.ts` file:

```typescript
/// <reference types="material-ui-toaster/types" />
```

## Basic Usage

First, add the `Toaster` component to your application, preferably in your root component:

```jsx
import { Toaster } from 'material-ui-toaster';

function App() {
  return (
    <>
      <YourApp />
      <Toaster position="bottom-right" expand={true} duration={5000} />
    </>
  );
}
```

Then use the toast functions anywhere in your application:

```jsx
import { toaster } from 'material-ui-toaster';

function MyComponent() {
  const showToast = () => {
    toaster.success('Operation completed successfully!');
  };

  return <Button onClick={showToast}>Show Toast</Button>;
}
```

## API Reference

### Toaster Component Props

| Prop          | Type                                                                                                               | Default          | Description                                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------------------------------------- |
| `position`    | `'top-left'` \| `'top-center'` \| `'top-right'` \| `'bottom-left'` \| `'bottom-center'` \| `'bottom-right'` | `'bottom-right'` | Position of the toast stack                 |
| `expand`      | `boolean`                                                            | `false`          | Whether to expand the toast list by default |
| `gap`         | `number`                                                             | `16`             | Gap between toast items                     |
| `maxVisible`  | `number`                                                             | `3`              | Maximum number of visible toasts            |
| `duration`    | `number`                                                             | `5000`           | Default duration in milliseconds            |
| `closeButton` | `ReactNode`                                                          | -                | Custom close button                         |

### Toast Methods

#### Basic Toasts

```jsx
// Default toast
toaster.toast({ message: 'Hello world', description: 'Optional description' });

// Success toast
toaster.success('Operation successful');

// Error toast
toaster.error('Something went wrong');

// Info toast
toaster.info('Did you know?');

// Warning toast
toaster.warning('Be careful!');
```

#### With Description

```jsx
toaster.success('File uploaded', {
  description: 'Your file has been successfully uploaded to the server',
});
```

#### With Custom Duration

```jsx
toaster.info('This will disappear quickly', { duration: 2000 });
```

#### With Action Button

```jsx
toaster.action(
  'Do you want to proceed?',
  'Confirm',
  () => {
    // Action to perform when button is clicked
    return saveData();
  },
  {
    success: 'Data saved successfully!',
    error: 'Failed to save data',
    description: 'This action cannot be undone',
    type: 'warning',
  },
);
```

#### Promise-based Toast

```jsx
const promise = fetch('/api/data');

toaster.promise('Loading data...', promise, {
  loading: 'Fetching data...',
  success: 'Data loaded successfully!',
  error: (err) => `Error: ${err.message}`,
});
```

#### Custom Content

```jsx
toaster.custom(
  <div>
    <h3>Custom Component</h3>
    <p>This is a fully custom React component inside a toast!</p>
  </div>,
);
```

### Dismissing Toasts

```jsx
// Dismiss a specific toast using its ID
const id = toaster.info('This can be dismissed');
toaster.dismiss(id);

// Clear all toasts
toaster.clear();
```

## Customization via MUI Theme

You can customize the appearance of the toaster components using the MUI theme system:

```jsx
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  components: {
    MuiToaster: {
      styleOverrides: {
        root: {
          // Custom styles for toaster container
        },
        container: {
          // Custom styles for toast container
        },
      },
    },
    MuiToast: {
      styleOverrides: {
        root: {
          // Custom styles for individual toasts
        },
        content: {
          // Custom styles for toast content
        },
        message: {
          // Custom styles for toast message
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <YourApp />
      <Toaster />
    </ThemeProvider>
  );
}
```

## Acknowledgements

Special thanks to [sonner](https://sonner.emilkowal.ski/) for the animation inspiration.

## License

MIT
