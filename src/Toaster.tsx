import { Portal } from '@mui/material';
import { styled, useThemeProps } from '@mui/material/styles';
import { unstable_composeClasses as composeClasses } from '@mui/utils';
import * as React from 'react';
import ReactDOM from 'react-dom';

import Toast from './Toast';
import { ToastData, ToastToDismiss, ToasterEvents } from './ToasterEvents';
import { swipeInDown, swipeInUp, swipeOutDown, swipeOutUp } from './toaster-animations';
import { getToasterUtilityClass } from './toasterClasses';

// 定义 Toaster 位置类型
export type ToasterPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

// 组件属性类型
export interface ToasterProps {
  /**
   * 自定义样式类名
   */
  className?: string;
  /**
   * Toaster 位置
   * @default 'bottom-right'
   */
  position?: ToasterPosition;
  /**
   * Toast 之间的间距
   * @default 16
   */
  gap?: number;
  /**
   * 是否展开 Toast 列表
   * @default true
   */
  expand?: boolean;
  /**
   * 可见 Toast 的最大数量
   * @default 3
   */
  maxVisible?: number;
  /**
   * Toast默认持续时间(毫秒)
   * @default 5000
   */
  duration?: number;
  /**
   * 子元素
   */
  children?: React.ReactNode;
  /**
   * 自定义关闭按钮
   */
  closeButton?: React.ReactNode;
}

// Toaster组件slots
export interface ToasterSlots {
  /**
   * 根元素
   * @default 'div'
   */
  root?: React.ElementType;
  /**
   * 容器元素
   * @default 'div'
   */
  container?: React.ElementType;
  /**
   * Toast元素
   * @default Toast
   */
  toast?: React.ElementType;
  /**
   * 关闭按钮
   * @default 内置关闭按钮
   */
  closeButton?: React.ElementType;
}

// Toaster组件slot属性
export interface ToasterSlotProps {
  root?: Record<string, any>;
  container?: Record<string, any>;
  toast?: Record<string, any>;
  closeButton?: Record<string, any>;
}

// 所有组件Slots的类型
export interface ToasterOwnerState extends ToasterProps {
  position: ToasterPosition;
}

// 获取组件样式类
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

// 根容器样式
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

// 容器样式
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
    expand = true,
    maxVisible = 3,
    duration = 5000,
    children,
    closeButton,
    ...other
  } = props;

  // 状态管理
  const [toasts, setToasts] = React.useState<ToastData[]>([]);
  const [isHovered, setIsHovered] = React.useState(false);
  const [containerHeight, setContainerHeight] = React.useState<number>(0);
  const isBottom = position.startsWith('bottom');
  const isTop = position.startsWith('top');

  // 计算当前展开状态（根据prop和鼠标状态）
  const isExpanded = React.useMemo(() => expand || isHovered, [expand, isHovered]);

  const ownerState = {
    ...props,
    position,
    expand: isExpanded,
  };

  const classes = useUtilityClasses(ownerState);

  // 鼠标事件处理函数
  const handleMouseEnter = React.useCallback(() => {
    if (!expand) {
      setIsHovered(true);
    }
  }, [expand]);

  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false);
  }, []);

  // 最前面的Toast的高度
  const firstToastHeight = React.useMemo(() => {
    if (toasts.length <= 0) {
      return 0;
    }
    // 排序后排出height未测量出的toast
    const firstToast = toasts
      .sort((a, b) => {
        const posA = a.position || 0;
        const posB = b.position || 0;
        return posB - posA;
      })
      .filter((t) => t.height !== undefined)[0];
    return firstToast?.height;
  }, [toasts]);

  // 订阅事件系统
  React.useEffect(() => {
    // 处理Toast事件
    const unsubscribe = ToasterEvents.subscribe((toast) => {
      // 检查是否为dismiss事件
      if ('dismiss' in toast) {
        // 标记toast为删除状态
        requestAnimationFrame(() => {
          setToasts((prevToasts) => {
            return prevToasts.map((t) => (t.id === toast.id ? { ...t, delete: true } : t));
          });
        });
        return;
      }

      // 处理添加或更新通知
      if ('message' in toast) {
        setTimeout(() => {
          ReactDOM.flushSync(() => {
            setToasts((prevToasts) => {
              const existingToastIndex = prevToasts.findIndex((t) => t.id === toast.id);

              // 更新现有通知
              if (existingToastIndex !== -1) {
                return [
                  ...prevToasts.slice(0, existingToastIndex),
                  { ...prevToasts[existingToastIndex], ...toast },
                  ...prevToasts.slice(existingToastIndex + 1),
                ];
              }

              // 添加新通知
              return [toast as ToastData, ...prevToasts];
            });
          });
        });
      }
    });

    // 处理清除事件
    const clearUnsubscribe = ToasterEvents.onClear(() => {
      setToasts([]);
    });

    // 组件卸载时取消订阅
    return () => {
      unsubscribe();
      clearUnsubscribe();
    };
  }, []);

  // 处理通知自动关闭
  React.useEffect(() => {
    const timeouts: number[] = [];

    toasts.forEach((toast) => {
      // 跳过以下情况：
      // 1. 已标记为删除的toast
      // 2. 用户当前正在悬停
      // 3. 有正在进行的Promise
      // 4. Action按钮处于loading状态
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

  // 更新Toast高度
  const updateToastHeight = React.useCallback((id: number, height: number) => {
    setToasts((prevToasts) =>
      prevToasts.map((toast) => (toast.id === id ? { ...toast, height } : toast)),
    );
  }, []);

  // 处理action按钮点击
  const handleActionClick = React.useCallback(async (toast: ToastData) => {
    if (!toast.actionClick) return;

    try {
      // 设置loading状态
      setToasts((prevToasts) =>
        prevToasts.map((t) => (t.id === toast.id ? { ...t, actionLoading: true } : t)),
      );

      // 执行action点击处理函数
      const result = await toast.actionClick();

      // 恢复loading状态并处理返回结果
      setToasts((prevToasts) =>
        prevToasts.map((t) => {
          if (t.id === toast.id) {
            // 如果action处理函数返回了对象，则使用它更新当前toast
            if (result && typeof result === 'object') {
              return {
                ...t,
                ...result,
                actionLoading: false,
              };
            }
            // 否则只是恢复loading状态
            return { ...t, actionLoading: false };
          }
          return t;
        }),
      );

      return result;
    } catch (error) {
      // 出错时更新toast为错误状态
      setToasts((prevToasts) =>
        prevToasts.map((t) => {
          if (t.id === toast.id) {
            return {
              ...t,
              actionLoading: false,
              type: 'error',
              message: '操作失败',
              description: error instanceof Error ? error.message : '未知错误',
            };
          }
          return t;
        }),
      );
      throw error;
    }
  }, []);

  // 删除已标记为删除的通知
  const removeDeletedToasts = React.useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  // 计算容器高度
  React.useEffect(() => {
    if (toasts.length === 0) {
      setContainerHeight(0);
      return;
    }

    if (isExpanded) {
      // 只计算前 maxVisible 个toast的高度
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
      // 折叠模式下，容器高度为最上面那个toast的高度
      const firstToast = [...toasts].sort((a, b) => {
        const posA = a.position || 0;
        const posB = b.position || 0;
        return posB - posA;
      })[0];
      setContainerHeight(firstToast?.height || 0);
    }
  }, [toasts, isExpanded, gap, maxVisible]);

  // 计算Toast位置
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

  // 获取Toast样式
  const getToastStyle = React.useCallback(
    (index: number, toast: ToastData): React.CSSProperties => {
      // 计算实际位置索引，考虑是否有标记为删除的toast
      let effectiveIndex = index;
      if (isExpanded) {
        // 根据实际位置计算，不考虑已标记为删除的toast
        const visibleToasts = toasts.filter((t) => !t.delete);
        effectiveIndex = visibleToasts.indexOf(toast);
        if (effectiveIndex === -1) effectiveIndex = index;
      }

      // 滑动动画的起始值
      let swipeAmountY;
      if (isExpanded) {
        const yOffset = calculatePosition(effectiveIndex);
        swipeAmountY = `${isBottom ? '-' : ''}${yOffset}px`;
      } else {
        swipeAmountY = `${isBottom ? '-' : ''}${effectiveIndex * 16}px`;
      }

      // 基础样式
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
        transition: 'opacity 200ms, transform 200ms',
        pointerEvents: index < maxVisible ? 'auto' : 'none', // 超出可见数量的toast无法点击
      } as React.CSSProperties;

      // 根据展开状态设置不同的样式
      if (isExpanded) {
        const yOffset = calculatePosition(effectiveIndex);
        return {
          ...baseStyle,
          transform: `translateY(${isBottom ? '-' : ''}${yOffset}px)`,
          // 新元素添加初始样式
          ...(!toast.height && {
            opacity: 0,
            transform: isTop
              ? `translateY(calc(${isBottom ? '-' : ''}${yOffset}px - 100%))`
              : `translateY(calc(${isBottom ? '-' : ''}${yOffset}px + 100%))`,
          }),
          // 删除元素的样式
          ...(toast.delete && {
            animation: `${isTop ? swipeOutUp : swipeOutDown} 0.25s forwards`,
          }),
          // 当有toast被删除时，让隐藏的toast立即开始滑入
          ...(toasts.some((t) => t.delete) &&
            index >= maxVisible - 1 && {
              opacity: 1,
              transform: `translateY(${isBottom ? '-' : ''}${yOffset}px)`,
              transition: 'opacity 200ms, transform 200ms',
            }),
        };
      } else {
        return {
          ...baseStyle,
          transform: `translateY(${isBottom ? '-' : ''}${effectiveIndex * 16}px) scale(${1 - effectiveIndex * 0.05})`,
          // 新元素添加初始样式
          ...(!toast.height && {
            opacity: 0,
            transform: isTop
              ? `translateY(calc(${isBottom ? '-' : ''}${effectiveIndex * 16}px - 100%)) scale(${1 - effectiveIndex * 0.05})`
              : `translateY(calc(${isBottom ? '-' : ''}${effectiveIndex * 16}px + 100%)) scale(${1 - effectiveIndex * 0.05})`,
          }),
          // 删除元素的样式
          ...(toast.delete && {
            animation: `${isTop ? swipeOutUp : swipeOutDown} 0.25s forwards`,
          }),
          // 当有toast被删除时，让隐藏的toast立即开始滑入
          ...(toasts.some((t) => t.delete) &&
            index >= maxVisible - 1 && {
              opacity: 1,
              transform: `translateY(${isBottom ? '-' : ''}${effectiveIndex * 16}px) scale(${1 - effectiveIndex * 0.05})`,
              transition: 'opacity 200ms, transform 200ms',
            }),
        };
      }
    },
    [isExpanded, calculatePosition, isBottom, isTop, maxVisible, toasts, gap],
  );

  // 获取动画
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

  // 处理动画结束
  const handleAnimationEnd = React.useCallback(
    (toast: ToastData) => {
      if (toast.delete) {
        removeDeletedToasts(toast.id);
      }
    },
    [removeDeletedToasts],
  );

  // 加强版的删除Toast处理函数
  const handleCloseToast = React.useCallback((toast: ToastData) => {
    // 先标记为删除状态，让它开始动画
    setToasts((prevToasts) => {
      const updatedToasts = prevToasts.map((t) => (t.id === toast.id ? { ...t, delete: true } : t));

      // 重新计算所有toast的位置，确保上方的toast立即重新定位
      const deletedIndex = prevToasts.findIndex((t) => t.id === toast.id);
      if (deletedIndex !== -1) {
        // 通知布局已更改，触发重新渲染
        setTimeout(() => {
          // 强制更新以重新计算位置
          setToasts([...updatedToasts]);
        }, 0);
      }

      return updatedToasts;
    });

    // 通知事件系统
    try {
      if (toast.onClose) {
        toast.onClose();
      }
    } catch (err) {
      console.error('执行toast.onClose回调时出错:', err);
    }

    // 发送dismiss事件
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
            // 只渲染 maxVisible + 1 个toast，多一个用于显示消失动画
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
                  // 堆叠高度
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
