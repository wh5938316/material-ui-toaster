import { ToasterPosition } from './Toaster';
import { getToastUtilityClass, toastClasses } from './toastClasses';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import { Button, IconButton, Typography } from '@mui/material';
import { blue, green, red, yellow } from '@mui/material/colors';
import { styled, useThemeProps } from '@mui/material/styles';
import { unstable_composeClasses as composeClasses } from '@mui/utils';
import * as React from 'react';

// Toast properties interface
export interface ToastProps {
  /**
   * Notification content
   */
  message: React.ReactNode;
  /**
   * Notification description (optional)
   */
  description?: React.ReactNode;
  /**
   * Notification type
   * @default 'default'
   */
  type?: 'info' | 'success' | 'warning' | 'error' | 'default';
  /**
   * Close callback function
   */
  onClose?: () => void;
  /**
   * CSS styles
   */
  style?: React.CSSProperties;
  /**
   * Custom class name
   */
  className?: string;
  /**
   * Custom animation
   */
  animation?: string;
  /**
   * Component internal state
   */
  ownerState?: ToastOwnerState;
  /**
   * Notification height change callback function
   */
  onHeightChange?: (id: number, height: number) => void;
  /**
   * Animation end callback function
   */
  onAnimationEnd?: () => void;
  /**
   * Custom icon
   */
  icon?: React.ReactNode;
  /**
   * Action button text
   */
  actionLabel?: string;
  /**
   * Action button click handler
   */
  actionClick?: () => void | Promise<any>;
  /**
   * Whether the action button is in loading state
   */
  actionLoading?: boolean;
  /**
   * Custom content
   */
  customContent?: React.ReactNode;
}

// Toast internal state interface
export interface ToastOwnerState extends Omit<ToastProps, 'ownerState'> {
  position?: ToasterPosition;
  id?: number;
  isNew?: boolean;
  isDeleting?: boolean;
  height?: number;
  isExpanded: boolean;
  stackHeight?: number;
  isFirst?: boolean;
}

// Toast component slots
export interface ToastSlots {
  /**
   * Root element
   * @default 'li'
   */
  root?: React.ElementType;
  /**
   * Content container element
   * @default 'div'
   */
  content?: React.ElementType;
  /**
   * Message element
   * @default Typography
   */
  message?: React.ElementType;
  /**
   * Description element
   * @default Typography
   */
  description?: React.ElementType;
  /**
   * Close button element
   * @default IconButton
   */
  closeButton?: React.ElementType;
  /**
   * Close icon
   * @default CloseIcon
   */
  closeIcon?: React.ElementType;
  /**
   * Icon container
   * @default 'div'
   */
  iconContainer?: React.ElementType;
  /**
   * Action button
   * @default Button
   */
  actionButton?: React.ElementType;
}

// Toast component slot properties
export interface ToastSlotProps {
  root?: Record<string, any>;
  content?: Record<string, any>;
  message?: Record<string, any>;
  description?: Record<string, any>;
  closeButton?: Record<string, any>;
  closeIcon?: Record<string, any>;
  iconContainer?: Record<string, any>;
  actionButton?: Record<string, any>;
}

// Get component style classes
const useUtilityClasses = (ownerState: ToastOwnerState) => {
  const { type, isNew, isDeleting, isFirst } = ownerState;
  const slots = {
    root: [
      'root',
      type && `type${type.charAt(0).toUpperCase() + type.slice(1)}`,
      isNew && 'new',
      isDeleting && 'deleting',
      isFirst && 'first',
    ],
    content: ['content'],
    message: ['message'],
    description: ['description'],
    closeButton: ['closeButton'],
    iconContainer: ['iconContainer'],
    actionButton: ['actionButton'],
  };

  return composeClasses(slots, getToastUtilityClass, {});
};

// Get the default icon corresponding to the notification type
export const getDefaultIcon = (type?: string) => {
  switch (type) {
    case 'info':
      return <InfoIcon color="info" />;
    case 'success':
      return <CheckCircleIcon color="success" />;
    case 'warning':
      return <WarningIcon color="warning" />;
    case 'error':
      return <ErrorIcon color="error" />;
    default:
      return null;
  }
};

// Toast root element style
const ToastRoot = styled('li', {
  name: 'MuiToast',
  slot: 'Root',
  shouldForwardProp: (prop) => prop !== 'ownerState' && prop !== 'animation',
})<{ ownerState: ToastOwnerState; animation?: string }>(({ theme, ownerState, animation }) => ({
  width: '100%',
  position: 'absolute',
  overflow: 'visible',
  listStyle: 'none',
  transition: theme.transitions.create(['transform', 'opacity', 'height'], {
    duration: 400,
    easing: theme.transitions.easing.easeOut,
  }),
  cursor: 'default',
  willChange: 'transform, opacity',

  // Add spacing pseudo-element
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    height: 'calc(var(--gap) + 1px)',
    bottom: '100%',
    width: '100%',
  },

  height: ownerState.isExpanded ? 'auto' : (ownerState.stackHeight ?? 'auto'),

  // Deleting state
  ...(ownerState.isDeleting && {
    pointerEvents: 'none',
    animation: `${animation} 0.2s ease-out forwards`,
    willChange: 'transform, opacity',
    backfaceVisibility: 'hidden',
    WebkitFontSmoothing: 'antialiased',
  }),

  backgroundColor: theme.palette.background.paper,

  // Default type style
  [`&.${toastClasses.typeDefault} .${toastClasses.content}`]: {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.background.paper,
  },

  // Success type style
  [`&.${toastClasses.typeSuccess} .${toastClasses.content}`]: {
    backgroundColor: green[50],
    color: theme.palette.success.main,
  },

  // Error type style
  [`&.${toastClasses.typeError} .${toastClasses.content}`]: {
    backgroundColor: red[50],
    color: theme.palette.error.main,
  },

  // Info type style
  [`&.${toastClasses.typeInfo} .${toastClasses.content}`]: {
    backgroundColor: blue[50],
    color: theme.palette.info.main,
  },

  // Warning type style
  [`&.${toastClasses.typeWarning} .${toastClasses.content}`]: {
    backgroundColor: yellow[50],
    color: theme.palette.warning.main,
  },
}));

// Notification content style
const ToastContent = styled('div', {
  name: 'MuiToast',
  slot: 'Content',
})<{ ownerState: ToastOwnerState }>(({ theme, ownerState }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  position: 'relative',
  boxShadow: theme.shadows[2],
  borderRadius: theme.shape.borderRadius,

  // Hover effect
  '&:hover': {
    boxShadow: theme.shadows[4],
  },
}));

// Icon container style
const ToastIconContainer = styled('div', {
  name: 'MuiToast',
  slot: 'IconContainer',
})(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginRight: theme.spacing(1.5),
}));

// Content area style (includes icons and text)
const ToastContentArea = styled('div', {
  name: 'MuiToast',
  slot: 'ContentArea',
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  width: '100%',
}));

// Text area style
const ToastTextArea = styled('div', {
  name: 'MuiToast',
  slot: 'TextArea',
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
}));

// Notification message style
const ToastMessage = styled(Typography, {
  name: 'MuiToast',
  slot: 'Message',
})(({ theme }) => ({
  fontWeight: 500,
}));

// Notification description style
const ToastDescription = styled(Typography, {
  name: 'MuiToast',
  slot: 'Description',
})(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

// Close button style
const CloseButton = styled(IconButton, {
  name: 'MuiToast',
  slot: 'CloseButton',
})(({ theme }) => ({
  zIndex: 2,
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  padding: theme.spacing(0.5),
}));

// Action button style
const ActionButton = styled(Button, {
  name: 'MuiToast',
  slot: 'ActionButton',
})(({ theme }) => ({
  alignSelf: 'flex-start',
  marginTop: theme.spacing(1),
}));

const Toast = React.forwardRef<HTMLLIElement, ToastProps>(function Toast(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiToast' });
  const toastRef = React.useRef<HTMLDivElement>(null);
  const {
    message,
    description,
    onClose,
    animation,
    ownerState: ownerStateProp,
    style,
    className,
    onAnimationEnd,
    onHeightChange,
    type = 'default',
    icon,
    actionLabel,
    actionClick,
    actionLoading = false,
    customContent,
    ...other
  } = props;

  // Action button click handler
  const [isActionLoading, setIsActionLoading] = React.useState(actionLoading);

  const handleActionClick = React.useCallback(async () => {
    if (!actionClick || isActionLoading) return;

    try {
      setIsActionLoading(true);
      const result = await actionClick();
      setIsActionLoading(false);
      return result;
    } catch (error) {
      setIsActionLoading(false);
      throw error;
    }
  }, [actionClick, isActionLoading]);

  const ownerState = {
    ...props,
    ...ownerStateProp,
  };

  const classes = useUtilityClasses(ownerState as ToastOwnerState);

  // Get display icon
  const displayIcon = icon || getDefaultIcon(type);

  // After notification element is mounted, measure and report its height
  React.useEffect(() => {
    const toastNode = toastRef.current;
    if (toastNode && ownerState.id) {
      const height = toastNode.getBoundingClientRect().height;
      if (typeof ownerState.onHeightChange === 'function') {
        ownerState.onHeightChange(ownerState.id, height);
      }
    }
  }, [
    ownerState.id,
    ownerState.onHeightChange,
    message,
    type,
    description,
    actionLabel,
    isActionLoading,
    customContent,
  ]);

  // If there is custom content, render it directly
  if (customContent) {
    return (
      <ToastRoot
        ref={ref}
        className={`${classes.root} ${className || ''}`}
        ownerState={ownerState as ToastOwnerState}
        animation={animation}
        style={style}
        onAnimationEnd={onAnimationEnd}
        {...other}
      >
        <ToastContent
          ref={toastRef}
          className={classes.content}
          ownerState={ownerState as ToastOwnerState}
        >
          {customContent}

          {onClose && (
            <CloseButton
              size="small"
              aria-label="Close notification"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className={classes.closeButton}
            >
              <CloseIcon fontSize="small" />
            </CloseButton>
          )}
        </ToastContent>
      </ToastRoot>
    );
  }

  return (
    <ToastRoot
      ref={ref}
      className={`${classes.root} ${className || ''}`}
      ownerState={ownerState as ToastOwnerState}
      animation={animation}
      style={style}
      onAnimationEnd={onAnimationEnd}
      {...other}
    >
      <ToastContent
        ref={toastRef}
        className={classes.content}
        ownerState={ownerState as ToastOwnerState}
      >
        <ToastContentArea>
          {displayIcon && (
            <ToastIconContainer className={classes.iconContainer}>{displayIcon}</ToastIconContainer>
          )}

          <ToastTextArea>
            <ToastMessage variant="body1" className={classes.message}>
              {message}
            </ToastMessage>

            {description && (
              <ToastDescription variant="body2" className={classes.description}>
                {description}
              </ToastDescription>
            )}
          </ToastTextArea>
        </ToastContentArea>

        {actionLabel && actionClick && (
          <ActionButton
            variant="contained"
            size="small"
            onClick={handleActionClick}
            disabled={isActionLoading}
            loading={isActionLoading}
            className={classes.actionButton}
          >
            {actionLabel}
          </ActionButton>
        )}

        {onClose && (
          <CloseButton
            size="small"
            aria-label="Close notification"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={classes.closeButton}
          >
            <CloseIcon fontSize="small" />
          </CloseButton>
        )}
      </ToastContent>
    </ToastRoot>
  );
});

Toast.displayName = 'Toast';

// Apply React.memo to enhance performance, preventing unnecessary re-renders
export default React.memo(Toast, (prevProps, nextProps) => {
  // If the toast is already being deleted, don't re-render
  if (prevProps.ownerState?.isDeleting && nextProps.ownerState?.isDeleting) {
    return true; // Return true to skip re-render
  }

  // If key properties remain the same, skip re-rendering
  if (
    prevProps.message === nextProps.message &&
    prevProps.description === nextProps.description &&
    prevProps.type === nextProps.type &&
    prevProps.actionLabel === nextProps.actionLabel &&
    prevProps.actionLoading === nextProps.actionLoading &&
    JSON.stringify(prevProps.style) === JSON.stringify(nextProps.style) &&
    prevProps.ownerState?.isExpanded === nextProps.ownerState?.isExpanded
  ) {
    return true;
  }

  // Otherwise allow re-render
  return false;
});
