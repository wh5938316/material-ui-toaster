import Toast from './Toast';
import { ToastData, ToasterEvents } from './ToasterEvents';
import { swipeInDown, swipeInUp, swipeOutDown, swipeOutUp } from './toaster-animations';
import { getToasterUtilityClass } from './toasterClasses';
import { Portal } from '@mui/material';
import { styled, useThemeProps } from '@mui/material/styles';
import { unstable_composeClasses as composeClasses } from '@mui/utils';
import * as React from 'react';
import ReactDOM from 'react-dom';

// Define Toaster position type
export type ToasterPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

// Component props type
export interface ToasterProps {
  /**
   * Custom style class name
   */
  className?: string;
  /**
   * Toaster position
   * @default 'bottom-right'
   */
  position?: ToasterPosition;
  /**
   * Gap between Toast items
   * @default 16
   */
  gap?: number;
  /**
   * Whether to expand the Toast list
   * @default true
   */
  expand?: boolean;
  /**
   * Maximum number of visible Toasts
   * @default 3
   */
  maxVisible?: number;
  /**
   * Default duration of Toast (milliseconds)
   * @default 5000
   */
  duration?: number;
  /**
   * Children elements
   */
  children?: React.ReactNode;
  /**
   * Custom close button
   */
  closeButton?: React.ReactNode;
}

// Toaster component slots
export interface ToasterSlots {
  /**
   * Root element
   * @default 'div'
   */
  root?: React.ElementType;
  /**
   * Container element
   * @default 'div'
   */
  container?: React.ElementType;
  /**
   * Toast element
   * @default Toast
   */
  toast?: React.ElementType;
  /**
   * Close button
   * @default Built-in close button
   */
  closeButton?: React.ElementType;
}

// Toaster component slot properties
export interface ToasterSlotProps {
  root?: Record<string, any>;
  container?: Record<string, any>;
  toast?: Record<string, any>;
  closeButton?: Record<string, any>;
}

// Type for all component slots
export interface ToasterOwnerState extends ToasterProps {
  position: ToasterPosition;
}

// Get component style classes
const useUtilityClasses = (ownerState: ToasterOwnerState) => {
  const { position, expand } = ownerState;
  const slots = {
    root: [
      'root',
      position && `position${position.charAt(0).toUpperCase() + position.slice(1)}`,
      expand && 'expanded',
    ],
    container: ['container'],
  };

  return composeClasses(slots, getToasterUtilityClass, {});
};

// Root container style
const ToasterRoot = styled('div', {
  name: 'MuiToaster',
  slot: 'Root',
})<{ ownerState: ToasterOwnerState }>(({ theme, ownerState }) => {
  const [vertical, horizontal] = ownerState.position.split('-');

  return {
    position: 'fixed',
    zIndex: theme.zIndex.snackbar,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'visible',

    ...(vertical === 'top' ? { top: 24 } : { bottom: 24 }),
    ...(horizontal === 'left' ? { left: 24 } : { right: 24 }),

    [theme.breakpoints.down('sm')]: {
      ...(vertical === 'top' ? { top: 16 } : { bottom: 16 }),
      ...(horizontal === 'left' ? { left: 16 } : { right: 16 }),
    },
  };
});

// Container style
const ToasterContainer = styled('div', {
  name: 'MuiToaster',
  slot: 'Container',
})<{ ownerState: ToasterOwnerState }>(({ theme, ownerState }) => ({
  position: 'relative',
  width: 360,
  transition: theme.transitions.create('height', {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.standard,
  }),

  [theme.breakpoints.down('sm')]: {
    width: 'calc(100vw - 32px)',
  },
}));

const Toaster = React.forwardRef<HTMLDivElement, ToasterProps>(function Toaster(inProps, ref) {
  const props = useThemeProps({ props: inProps, name: 'MuiToaster' });
  const {
    className,
    position = 'bottom-right',
    gap = 16,
    expand = false,
    maxVisible = 3,
    duration = 5000,
    children,
    closeButton,
    ...other
  } = props;

  // State management
  const [toasts, setToasts] = React.useState<ToastData[]>([]);
  const [isHovered, setIsHovered] = React.useState(false);
  const [containerHeight, setContainerHeight] = React.useState<number>(0);
  const isBottom = position.startsWith('bottom');
  const isTop = position.startsWith('top');

  // Calculate current expanded state (based on prop and mouse state)
  const isExpanded = React.useMemo(() => expand || isHovered, [expand, isHovered]);

  const ownerState = {
    ...props,
    position,
    expand: isExpanded,
  };

  const classes = useUtilityClasses(ownerState);

  // Mouse event handlers
  const handleMouseEnter = React.useCallback(() => {
    if (!expand) {
      setIsHovered(true);
    }
  }, [expand]);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  // Height of the first Toast
  const firstToastHeight = React.useMemo(() => {
    if (toasts.length <= 0) {
      return 0;
    }
    // Sort and filter out toasts with unmeasured height
    const firstToast = toasts
      .sort((a, b) => {
        const posA = a.position || 0;
        const posB = b.position || 0;
        return posB - posA;
      })
      .filter((t) => t.height !== undefined)[0];
    return firstToast?.height;
  }, [toasts]);

  // Subscribe to event system
  React.useEffect(() => {
    // Handle Toast events
    const unsubscribe = ToasterEvents.subscribe((toast) => {
      // Check if it's a dismiss event
      if ('dismiss' in toast) {
        // Mark toast for deletion
        requestAnimationFrame(() => {
          setToasts((prevToasts) => {
            return prevToasts.map((t) => (t.id === toast.id ? { ...t, delete: true } : t));
          });
        });
        return;
      }

      // Handle add or update notifications
      if ('message' in toast) {
        setTimeout(() => {
          ReactDOM.flushSync(() => {
            setToasts((prevToasts) => {
              const existingToastIndex = prevToasts.findIndex((t) => t.id === toast.id);

              // Update existing notification
              if (existingToastIndex !== -1) {
                return [
                  ...prevToasts.slice(0, existingToastIndex),
                  { ...prevToasts[existingToastIndex], ...toast },
                  ...prevToasts.slice(existingToastIndex + 1),
                ];
              }

              // Add new notification
              return [toast as ToastData, ...prevToasts];
            });
          });
        });
      }
    });

    // Handle clear events
    const clearUnsubscribe = ToasterEvents.onClear(() => {
      setToasts([]);
    });

    // Component unmounting cancels subscription
    return () => {
      unsubscribe();
      clearUnsubscribe();
    };
  }, []);

  // Handle notification auto-close
  React.useEffect(() => {
    const timeouts: number[] = [];

    toasts.forEach((toast) => {
      // Skip the following cases:
      // 1. Toast marked for deletion
      // 2. User currently hovering
      // 3. There's a pending Promise
      // 4. Action button is in loading state
      if (!toast.delete && !isHovered && !toast.promisePending && !toast.actionLoading) {
        const toastDuration = toast.duration || duration;
        const timeout = setTimeout(() => {
          ToasterEvents.dismiss(toast.id);
        }, toastDuration);

        timeouts.push(timeout);
      }
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [toasts, duration, isHovered]);

  // Update Toast height
  const updateToastHeight = React.useCallback((id: number, height: number) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) => (toast.id === id ? { ...toast, height } : toast)),
    );
  }, []);

  // Handle action button click
  const handleActionClick = React.useCallback(async (toast: ToastData) => {
    if (!toast.actionClick) return;

    try {
      // Set loading state
      setToasts((prevToasts) =>
        prevToasts.map((t) => (t.id === toast.id ? { ...t, actionLoading: true } : t)),
      );

      // Execute action click handler
      const result = await toast.actionClick();

      // Restore loading state and handle return result
      setToasts((prevToasts) =>
        prevToasts.map((t) => {
          if (t.id === toast.id) {
            // If the action handler returns an object, use it to update the current toast
            if (result && typeof result === 'object') {
              return {
                ...t,
                ...result,
                actionLoading: false,
              };
            }
            // Otherwise just restore loading state
            return { ...t, actionLoading: false };
          }
          return t;
        }),
      );

      return result;
    } catch (error) {
      // Error state update toast
      setToasts((prevToasts) =>
        prevToasts.map((t) => {
          if (t.id === toast.id) {
            return {
              ...t,
              actionLoading: false,
              type: 'error',
              message: 'Operation failed',
              description: error instanceof Error ? error.message : 'Unknown error',
            };
          }
          return t;
        }),
      );
      throw error;
    }
  }, []);

  // Remove deleted notifications
  const removeDeletedToasts = React.useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // Calculate container height
  React.useEffect(() => {
    if (toasts.length === 0) {
      setContainerHeight(0);
      return;
    }

    if (isExpanded) {
      // Calculate height of only the first maxVisible toasts
      const visibleToasts = [...toasts]
        .sort((a, b) => {
          const posA = a.position || 0;
          const posB = b.position || 0;
          return posB - posA;
        })
        .slice(0, maxVisible);

      const totalHeight = visibleToasts.reduce((sum, toast) => {
        const height = toast.height || 0;
        return sum + height + gap;
      }, 0);

      setContainerHeight(Math.max(totalHeight - gap, 0));
    } else {
      // Folded mode, container height is the height of the top toast
      const firstToast = [...toasts].sort((a, b) => {
        const posA = a.position || 0;
        const posB = b.position || 0;
        return posB - posA;
      })[0];
      setContainerHeight(firstToast?.height || 0);
    }
  }, [toasts, isExpanded, gap, maxVisible]);

  // Calculate Toast position
  const calculatePosition = React.useCallback(
    (index: number): number => {
      const sortedToasts = [...toasts].sort((a, b) => {
        const posA = a.position || 0;
        const posB = b.position || 0;
        return posB - posA;
      });

      let totalOffset = 0;
      for (let i = 0; i < index; i++) {
        const toast = sortedToasts[i];
        totalOffset += (toast.height || 0) + gap;
      }

      return totalOffset;
    },
    [toasts, gap],
  );

  // Get Toast style
  const getToastStyle = React.useCallback(
    (index: number, toast: ToastData): React.CSSProperties => {
      // Calculate effective index, considering deleted toasts
      let effectiveIndex = index;
      if (isExpanded) {
        // Calculate based on actual position, ignoring deleted toasts
        const visibleToasts = toasts.filter((t) => !t.delete);
        effectiveIndex = visibleToasts.indexOf(toast);
        if (effectiveIndex === -1) effectiveIndex = index;
      }

      // Swipe animation start value
      let swipeAmountY;
      if (isExpanded) {
        const yOffset = calculatePosition(effectiveIndex);
        swipeAmountY = `${isBottom ? '-' : ''}${yOffset}px`;
      } else {
        swipeAmountY = `${isBottom ? '-' : ''}${effectiveIndex * 16}px`;
      }

      // Base style
      const baseStyle = {
        '--gap': `${gap}px`,
        '--swipe-amount-y': swipeAmountY,
        zIndex: toasts.length - index,
        position: 'absolute',
        right: 0,
        left: 0,
        bottom: isBottom ? 0 : 'auto',
        top: !isBottom ? 0 : 'auto',
        opacity: index < maxVisible ? 1 : 0,
        pointerEvents: index < maxVisible ? 'auto' : 'none', // Toasts beyond visible count cannot be clicked
      } as React.CSSProperties;

      // Set different styles based on expanded state
      if (isExpanded) {
        const yOffset = calculatePosition(effectiveIndex);
        return {
          ...baseStyle,
          transform: `translateY(${isBottom ? '-' : ''}${yOffset}px)`,
          // New element initial style
          ...(!toast.height && {
            opacity: 0,
            transform: isTop
              ? `translateY(calc(${isBottom ? '-' : ''}${yOffset}px - 100%))`
              : `translateY(calc(${isBottom ? '-' : ''}${yOffset}px + 100%))`,
          }),
          // Deleted element style
          ...(toast.delete && {
            animation: `${isTop ? swipeOutUp : swipeOutDown} 0.25s forwards`,
          }),
          // When a toast is deleted, hidden toast starts sliding in immediately
          ...(toasts.some((t) => t.delete) &&
            index >= maxVisible - 1 && {
              opacity: 1,
              transform: `translateY(${isBottom ? '-' : ''}${yOffset}px)`,
            }),
        };
      } else {
        return {
          ...baseStyle,
          transform: `translateY(${isBottom ? '-' : ''}${effectiveIndex * 16}px) scale(${1 - effectiveIndex * 0.05})`,
          // New element initial style
          ...(!toast.height && {
            opacity: 0,
            transform: isTop
              ? `translateY(calc(${isBottom ? '-' : ''}${effectiveIndex * 16}px - 100%)) scale(${1 - effectiveIndex * 0.05})`
              : `translateY(calc(${isBottom ? '-' : ''}${effectiveIndex * 16}px + 100%)) scale(${1 - effectiveIndex * 0.05})`,
          }),
          // Deleted element style
          ...(toast.delete && {
            animation: `${isTop ? swipeOutUp : swipeOutDown} 0.25s forwards`,
          }),
          // When a toast is deleted, hidden toast starts sliding in immediately
          ...(toasts.some((t) => t.delete) &&
            index >= maxVisible - 1 && {
              opacity: 1,
              transform: `translateY(${isBottom ? '-' : ''}${effectiveIndex * 16}px) scale(${1 - effectiveIndex * 0.05})`,
            }),
        };
      }
    },
    [isExpanded, calculatePosition, isBottom, isTop, maxVisible, toasts, gap],
  );

  // Get animation
  const getAnimation = React.useCallback(
    (toast: ToastData, index: number): string | undefined => {
      if (toast.delete) {
        return isTop ? swipeOutUp.toString() : swipeOutDown.toString();
      }

      if (!toast.height) {
        return isTop ? swipeInDown.toString() : swipeInUp.toString();
      }

      return undefined;
    },
    [isTop],
  );

  // Handle animation end
  const handleAnimationEnd = React.useCallback(
    (toast: ToastData) => {
      if (toast.delete) {
        removeDeletedToasts(toast.id);
      }
    },
    [removeDeletedToasts],
  );

  // Enhanced delete Toast handler
  const handleCloseToast = React.useCallback((toast: ToastData) => {
    // Mark for deletion, start animation
    setToasts((prevToasts) => {
      const updatedToasts = prevToasts.map((t) => (t.id === toast.id ? { ...t, delete: true } : t));

      // Recalculate all toast positions, ensure top toast immediately repositions
      const deletedIndex = prevToasts.findIndex((t) => t.id === toast.id);
      if (deletedIndex !== -1) {
        // Notify layout changed, trigger re-render
        setTimeout(() => {
          // Force update to recalculate position
          setToasts([...updatedToasts]);
        }, 0);
      }

      return updatedToasts;
    });

    // Notify event system
    try {
      if (toast.onClose) {
        toast.onClose();
      }
    } catch (err) {
      console.error('Error executing toast.onClose callback:', err);
    }

    // Send dismiss event
    ToasterEvents.dismiss(toast.id);
  }, []);

  return (
    <Portal>
      <ToasterRoot
        ref={ref}
        className={`${classes.root} ${className || ''}`}
        ownerState={ownerState}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...other}
      >
        <ToasterContainer
          ownerState={ownerState}
          className={classes.container}
          style={{ height: `${containerHeight}px` }}
        >
          {toasts
            .sort((a, b) => {
              const posA = a.position || 0;
              const posB = b.position || 0;
              return posB - posA;
            })
            // Render only maxVisible + 1 toasts, one extra for disappearing animation
            .slice(0, maxVisible + 1)
            .map((toast, index) => (
              <Toast
                key={toast.id}
                style={getToastStyle(index, toast)}
                message={toast.message}
                description={toast.description}
                type={toast.type}
                icon={toast.icon}
                actionLabel={toast.actionLabel}
                actionClick={toast.actionClick ? () => handleActionClick(toast) : undefined}
                actionLoading={toast.actionLoading}
                customContent={toast.customContent}
                onClose={() => handleCloseToast(toast)}
                animation={getAnimation(toast, index)}
                ownerState={{
                  id: toast.id,
                  position,
                  isExpanded,
                  isNew: !toast.height,
                  isDeleting: toast.delete,
                  message: toast.message,
                  // Stack height
                  stackHeight: firstToastHeight,
                  onHeightChange: updateToastHeight,
                }}
                onAnimationEnd={() => handleAnimationEnd(toast)}
              />
            ))}
        </ToasterContainer>
        {children}
      </ToasterRoot>
    </Portal>
  );
});

Toaster.displayName = 'Toaster';

export default Toaster;
