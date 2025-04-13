import Toast from './Toast';
import { ToastData, ToasterEvents } from './ToasterEvents';
import { swipeInDown, swipeInUp, swipeOutDown, swipeOutUp } from './toaster-animations';
import { getToasterUtilityClass } from './toasterClasses';
import { Timer } from './utils';
import Portal from '@mui/material/Portal';
import { styled, useThemeProps } from '@mui/material/styles';
import { debounce } from '@mui/material/utils';
import { unstable_composeClasses as composeClasses } from '@mui/utils';
import * as React from 'react';
import ReactDOM from 'react-dom';

// Define Toaster position type
export type ToasterPosition =
  | 'top-left'
  | 'top-right'
  | 'top-center'
  | 'bottom-left'
  | 'bottom-right'
  | 'bottom-center';

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
  isHovered?: boolean;
}

// Get component style classes
const useUtilityClasses = (ownerState: ToasterOwnerState) => {
  const { position, expand, isHovered } = ownerState;
  const slots = {
    root: [
      'root',
      position && `position${position.charAt(0).toUpperCase() + position.slice(1)}`,
      expand && 'expanded',
      isHovered && 'hovered',
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
    ...(horizontal === 'left'
      ? { left: 24 }
      : horizontal === 'center'
        ? {
            left: '50%',
            transform: 'translateX(-50%)',
          }
        : { right: 24 }),

    [theme.breakpoints.down('sm')]: {
      ...(vertical === 'top' ? { top: 16 } : { bottom: 16 }),
      ...(horizontal === 'left'
        ? { left: 16 }
        : horizontal === 'center'
          ? {
              left: '50%',
              transform: 'translateX(-50%)',
            }
          : { right: 16 }),
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
    duration: 400,
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
  // Use useRef to store timers instead of useState
  const autoDeleteTimersRef = React.useRef<Record<number, Timer>>({});

  // Style cache for deleted toasts to prevent unnecessary recalculations
  const styleCache = React.useRef<Map<number, React.CSSProperties>>(new Map());

  // Store fixed yOffset values for toasts being deleted
  const [deletedToastOffsets, setDeletedToastOffsets] = React.useState<Record<number, number>>({});

  const [isTop, isBottom] = React.useMemo(
    () => [position.startsWith('top'), position.startsWith('bottom')],
    [position],
  );

  // Calculate current expanded state (based on prop and mouse state)
  const isExpanded = React.useMemo(() => expand || isHovered, [expand, isHovered]);

  const ownerState = {
    ...props,
    position,
    expand: isExpanded,
    isHovered,
  };

  const classes = useUtilityClasses(ownerState);

  // Mouse event handlers
  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true);
    Object.values(autoDeleteTimersRef.current).forEach((timer) => timer.pause());
  }, [expand]);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
    Object.values(autoDeleteTimersRef.current).forEach((timer) => timer.resume());
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

  const setToastTimeout = React.useCallback(
    (toast: ToastData) => {
      // Skip timer creation if toast is deleted, has pending promise or loading action
      if (toast.delete || toast.promisePending || toast.actionLoading) {
        return;
      }

      // Cancel previous timer if exists
      if (autoDeleteTimersRef.current[toast.id]) {
        autoDeleteTimersRef.current[toast.id].clear();
      }

      const toastDuration = toast.duration || duration;

      const timer = new Timer(() => {
        ToasterEvents.dismiss(toast.id);
        // Remove timer directly from ref
        const newTimers = { ...autoDeleteTimersRef.current };
        delete newTimers[toast.id];
        autoDeleteTimersRef.current = newTimers;
      }, toastDuration);

      // Update ref directly
      autoDeleteTimersRef.current = {
        ...autoDeleteTimersRef.current,
        [toast.id]: timer,
      };
    },
    [duration],
  );

  // Subscribe to event system
  React.useEffect(() => {
    // Handle Toast events
    const unsubscribe = ToasterEvents.subscribe((toast) => {
      // Check if it's a dismiss event
      if ('dismiss' in toast) {
        // Clear timer for this toast
        if (autoDeleteTimersRef.current[toast.id]) {
          autoDeleteTimersRef.current[toast.id].clear();
          delete autoDeleteTimersRef.current[toast.id];
        }

        // Mark toast for deletion
        requestAnimationFrame(() => {
          setToasts((prevToasts) => {
            return prevToasts.map((t) => (t.id === toast.id ? { ...t, delete: true } : t));
          });
        });
        return;
      }

      setTimeout(() => {
        ReactDOM.flushSync(() => {
          setToasts((prevToasts) => {
            const existingToastIndex = prevToasts.findIndex((t) => t.id === toast.id);

            // Update existing toast
            if (existingToastIndex !== -1) {
              const updatedToast = {
                ...prevToasts[existingToastIndex],
                ...toast,
              };

              // Set auto-close timer for updated toast
              setToastTimeout(updatedToast as ToastData);

              return [
                ...prevToasts.slice(0, existingToastIndex),
                updatedToast,
                ...prevToasts.slice(existingToastIndex + 1),
              ];
            }

            // Add new toast
            const newToast = toast as ToastData;

            // Set auto-close timer for new toast
            setToastTimeout(newToast);

            return [newToast, ...prevToasts];
          });
        });
      });
    });

    // Handle clear all event
    const clearUnsubscribe = ToasterEvents.onClear(() => {
      // Clear all timers
      Object.values(autoDeleteTimersRef.current).forEach((timer) => timer.clear());
      autoDeleteTimersRef.current = {};
      setToasts([]);
    });

    // Cleanup on component unmount
    return () => {
      unsubscribe();
      clearUnsubscribe();
    };
  }, [setToastTimeout]);

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

  // Use debounce to optimize high-frequency container height updates
  const updateContainerHeight = React.useCallback(
    debounce(() => {
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
    }, 10),
    [toasts, isExpanded, gap, maxVisible],
  );

  // Use custom debounced function instead of original container height calculation
  React.useEffect(() => {
    updateContainerHeight();
  }, [toasts, isExpanded, updateContainerHeight]);

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
      // Check if this toast is being deleted and has a stored yOffset
      const hasFixedOffset = toast.delete && deletedToastOffsets[toast.id] !== undefined;

      // Calculate effective index, considering deleted toasts
      let effectiveIndex = index;
      if (isExpanded && !hasFixedOffset) {
        // Skip index calculation for toasts with fixed offsets
        // Calculate based on actual position, ignoring deleted toasts
        const visibleToasts = toasts.filter((t) => !t.delete);
        effectiveIndex = visibleToasts.indexOf(toast);
        if (effectiveIndex === -1) effectiveIndex = index;
      }

      // Swipe animation start value for CSS animation
      // For deleted toasts, use the stored fixed offset
      let swipeAmountY;
      if (hasFixedOffset) {
        const fixedOffset = deletedToastOffsets[toast.id];
        swipeAmountY = `${isBottom ? '-' : ''}${fixedOffset}px`;
      } else if (isExpanded) {
        const yOffset = calculatePosition(effectiveIndex);
        swipeAmountY = `${isBottom ? '-' : ''}${yOffset}px`;
      } else {
        swipeAmountY = `${isBottom ? '-' : ''}${effectiveIndex * 16}px`;
      }

      // Calculate scale value
      const scaleValue = isExpanded ? 1 : 1 - effectiveIndex * 0.05;

      // Check if toast is in visible area (within maxVisible limit)
      const isVisible = index < maxVisible;

      // Base style
      const baseStyle = {
        '--gap': `${gap}px`,
        '--swipe-amount-y': swipeAmountY, // This is used in animation keyframes
        '--scale': scaleValue, // Add scale CSS variable
        zIndex: toasts.length - index,
        position: 'absolute',
        right: 0,
        left: 0,
        bottom: isBottom ? 0 : 'auto',
        top: !isBottom ? 0 : 'auto',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none', // Toasts beyond visible count cannot be clicked
      } as React.CSSProperties;

      // Set different styles based on expanded state and deletion state
      if (isExpanded) {
        // For deleted toasts with fixed offset, use that offset
        const yOffset = hasFixedOffset
          ? deletedToastOffsets[toast.id]
          : calculatePosition(effectiveIndex);

        return {
          ...baseStyle,
          // For deleted toasts, maintain the fixed position
          transform: `translateY(${isBottom ? '-' : ''}${yOffset}px)`,
          // New element initial style
          ...(!toast.height && {
            opacity: 0,
            transform: isTop
              ? `translateY(calc(${isBottom ? '-' : ''}${yOffset}px - 100%))`
              : `translateY(calc(${isBottom ? '-' : ''}${yOffset}px + 100%))`,
          }),
          // Deleted element style - only apply animation for visible toasts
          ...(toast.delete &&
            isVisible && {
              animation: `${isTop ? swipeOutUp : swipeOutDown} 0.35s forwards`,
            }),
          // When a toast is deleted, hidden toast starts sliding in immediately
          ...(toasts.some((t) => t.delete) &&
            index >= maxVisible - 1 && {
              opacity: 1,
              transform: `translateY(${isBottom ? '-' : ''}${yOffset}px)`,
            }),
        };
      } else {
        // For non-expanded (folded) mode
        const yOffset = hasFixedOffset ? deletedToastOffsets[toast.id] : effectiveIndex * 16;

        return {
          ...baseStyle,
          transform: `translateY(${isBottom ? '-' : ''}${yOffset}px) scale(${scaleValue})`,
          // New element initial style
          ...(!toast.height && {
            opacity: 0,
            transform: isTop
              ? `translateY(calc(${isBottom ? '-' : ''}${yOffset}px - 100%)) scale(${scaleValue})`
              : `translateY(calc(${isBottom ? '-' : ''}${yOffset}px + 100%)) scale(${scaleValue})`,
          }),
          // Deleted element style - only apply animation for visible toasts
          ...(toast.delete &&
            isVisible && {
              animation: `${isTop ? swipeOutUp : swipeOutDown} 0.35s forwards`,
            }),
          // When a toast is deleted, hidden toast starts sliding in immediately
          ...(toasts.some((t) => t.delete) &&
            index >= maxVisible - 1 && {
              opacity: 1,
              transform: `translateY(${isBottom ? '-' : ''}${yOffset}px) scale(${scaleValue})`,
            }),
        };
      }
    },
    [isExpanded, calculatePosition, isBottom, isTop, maxVisible, toasts, gap, deletedToastOffsets],
  );

  // Get animation
  const getAnimation = React.useCallback(
    (toast: ToastData, index: number): string | undefined => {
      // Only apply animations to visible toasts
      const isVisible = index < maxVisible;

      if (toast.delete && isVisible) {
        return isTop ? swipeOutUp.toString() : swipeOutDown.toString();
      }

      if (!toast.height) {
        return isTop ? swipeInDown.toString() : swipeInUp.toString();
      }

      return undefined;
    },
    [isTop, maxVisible],
  );

  // Optimized toast style getter that caches styles for deleted toasts
  const getToastStyleOptimized = React.useCallback(
    (index: number, toast: ToastData): React.CSSProperties => {
      // If toast is being deleted and its style is already cached, return the cached style
      if (toast.delete && styleCache.current.has(toast.id)) {
        return styleCache.current.get(toast.id)!;
      }

      // Calculate the style normally
      const style = getToastStyle(index, toast);

      // If toast is being deleted, cache its style to prevent recalculations during animation
      if (toast.delete) {
        styleCache.current.set(toast.id, style);
      }

      return style;
    },
    [getToastStyle],
  );

  // Handle animation end
  const handleAnimationEnd = React.useCallback(
    (toast: ToastData) => {
      if (toast.delete) {
        // Use requestAnimationFrame to ensure smooth animation completion
        requestAnimationFrame(() => {
          // Clean up the stored yOffset for this toast
          setDeletedToastOffsets((prev) => {
            const newOffsets = { ...prev };
            delete newOffsets[toast.id];
            return newOffsets;
          });

          // Clean up cached style
          styleCache.current.delete(toast.id);

          // Remove the toast completely
          removeDeletedToasts(toast.id);
        });
      }
    },
    [removeDeletedToasts],
  );

  // Process toasts that need to be deleted without animation
  React.useEffect(() => {
    // Find all toasts marked for deletion
    const deletedToasts = toasts.filter((toast) => toast.delete);
    // Find all deleted toasts that are outside the visible range
    const invisibleDeletedToasts = deletedToasts.filter((toast, index) => {
      // Determine if the toast is visible based on its position in the sorted array
      const sortedToasts = [...toasts].sort((a, b) => {
        const posA = a.position || 0;
        const posB = b.position || 0;
        return posB - posA;
      });
      const toastIndex = sortedToasts.findIndex((t) => t.id === toast.id);
      return toastIndex >= maxVisible;
    });

    // Immediately remove invisible toasts without animation
    invisibleDeletedToasts.forEach((toast) => {
      removeDeletedToasts(toast.id);
      // Clean up stored offset values
      setDeletedToastOffsets((prev) => {
        const newOffsets = { ...prev };
        delete newOffsets[toast.id];
        return newOffsets;
      });
    });
  }, [toasts, maxVisible, removeDeletedToasts]);

  // Enhanced delete Toast handler
  const handleCloseToast = React.useCallback(
    (toast: ToastData) => {
      // First, calculate and store this toast's current yOffset before deletion
      // This will ensure animation always starts from the correct position
      let yOffset: number;
      let effectiveIndex = -1;

      // Find the toast's current index in the sorted list
      const sortedToasts = [...toasts].sort((a, b) => {
        const posA = a.position || 0;
        const posB = b.position || 0;
        return posB - posA;
      });
      effectiveIndex = sortedToasts.findIndex((t) => t.id === toast.id);

      if (effectiveIndex !== -1) {
        if (isExpanded) {
          // Calculate based on current position in expanded mode
          yOffset = calculatePosition(effectiveIndex);
        } else {
          // Calculate based on folded mode offset
          yOffset = effectiveIndex * 16;
        }

        // Store this fixed yOffset value for the deletion animation
        setDeletedToastOffsets((prev) => ({
          ...prev,
          [toast.id]: yOffset,
        }));
      }

      // Now mark for deletion and start animation
      requestAnimationFrame(() => {
        setToasts((prevToasts) => {
          const updatedToasts = prevToasts.map((t) =>
            t.id === toast.id ? { ...t, delete: true } : t,
          );
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
      });
    },
    [toasts, isExpanded, calculatePosition],
  );

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
          style={{ height: `${containerHeight}px`, willChange: 'height' }}
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
                style={getToastStyleOptimized(index, toast)}
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
                  // Don't update height for toasts being deleted
                  onHeightChange: toast.delete ? undefined : updateToastHeight,
                  isFirst: index === 0,
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
