import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import { Button, CircularProgress, IconButton, Typography } from '@mui/material';
import { styled, useThemeProps } from '@mui/material/styles';
import { unstable_composeClasses as composeClasses } from '@mui/utils';
import * as React from 'react';

import { ToasterPosition } from './Toaster';
import { ToastData } from './ToasterEvents';
import { getToastUtilityClass } from './toastClasses';

// Toast属性接口
export interface ToastProps {
  /**
   * 通知内容
   */
  message: React.ReactNode;
  /**
   * 通知描述（可选）
   */
  description?: React.ReactNode;
  /**
   * 通知类型
   * @default 'default'
   */
  type?: 'info' | 'success' | 'warning' | 'error' | 'default';
  /**
   * 关闭回调函数
   */
  onClose?: () => void;
  /**
   * CSS样式
   */
  style?: React.CSSProperties;
  /**
   * 自定义类名
   */
  className?: string;
  /**
   * 自定义动画
   */
  animation?: string;
  /**
   * 组件内部状态
   */
  ownerState?: ToastOwnerState;
  /**
   * 通知高度变化回调函数
   */
  onHeightChange?: (id: number, height: number) => void;
  /**
   * 动画结束回调函数
   */
  onAnimationEnd?: () => void;
  /**
   * 自定义图标
   */
  icon?: React.ReactNode;
  /**
   * 操作按钮文本
   */
  actionLabel?: string;
  /**
   * 操作按钮点击处理函数
   */
  actionClick?: () => void | Promise<any>;
  /**
   * 操作按钮是否处于加载状态
   */
  actionLoading?: boolean;
  /**
   * 自定义内容
   */
  customContent?: React.ReactNode;
}

// Toast内部状态接口
export interface ToastOwnerState extends Omit<ToastProps, 'ownerState'> {
  position?: ToasterPosition;
  id?: number;
  isNew?: boolean;
  isDeleting?: boolean;
  height?: number;
  isExpanded: boolean;
  stackHeight?: number;
}

// Toast组件slots
export interface ToastSlots {
  /**
   * 根元素
   * @default 'li'
   */
  root?: React.ElementType;
  /**
   * 内容容器元素
   * @default 'div'
   */
  content?: React.ElementType;
  /**
   * 消息元素
   * @default Typography
   */
  message?: React.ElementType;
  /**
   * 描述元素
   * @default Typography
   */
  description?: React.ElementType;
  /**
   * 关闭按钮元素
   * @default IconButton
   */
  closeButton?: React.ElementType;
  /**
   * 关闭图标
   * @default CloseIcon
   */
  closeIcon?: React.ElementType;
  /**
   * 图标容器
   * @default 'div'
   */
  iconContainer?: React.ElementType;
  /**
   * 操作按钮
   * @default Button
   */
  actionButton?: React.ElementType;
}

// Toast组件slot属性
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

// 获取组件样式类
const useUtilityClasses = (ownerState: ToastOwnerState) => {
  const { type, isNew, isDeleting } = ownerState;
  const slots = {
    root: [
      'root',
      type && `type${type.charAt(0).toUpperCase() + type.slice(1)}`,
      isNew && 'new',
      isDeleting && 'deleting',
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

// 获取通知类型对应的背景色
const getBackgroundColor = (type: string | undefined, theme: any) => {
  switch (type) {
    case 'success':
      return theme.palette.success.light;
    case 'error':
      return theme.palette.error.light;
    case 'info':
      return theme.palette.info.light;
    case 'warning':
      return theme.palette.warning.light;
    default:
      return theme.palette.background.paper;
  }
};

// 获取通知类型对应的默认图标
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

// Toast根元素样式
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

  // 添加间隔的伪元素
  '&::after': {
    content: '""',
    position: 'absolute',
    left: 0,
    height: 'calc(var(--gap) + 1px)',
    bottom: '100%',
    width: '100%',
    // pointerEvents: 'none',
  },

  height: ownerState.isExpanded ? 'auto' : (ownerState.stackHeight ?? 'auto'),

  // 删除状态
  ...(ownerState.isDeleting && {
    pointerEvents: 'none',
    animation: `${animation} 0.25s forwards`,
    willChange: 'transform, opacity',
  }),
}));

// 通知内容样式
const ToastContent = styled('div', {
  name: 'MuiToast',
  slot: 'Content',
})<{ ownerState: ToastOwnerState }>(({ theme, ownerState }) => ({
  padding: theme.spacing(2),
  backgroundColor: getBackgroundColor(ownerState.type, theme),
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(0.5),
  position: 'relative',
  boxShadow: theme.shadows[3],
  borderRadius: theme.shape.borderRadius,

  // 悬停效果
  '&:hover': {
    boxShadow: theme.shadows[6],
  },
}));

// 图标容器样式
const ToastIconContainer = styled('div', {
  name: 'MuiToast',
  slot: 'IconContainer',
})(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  marginRight: theme.spacing(1.5),
}));

// 内容区域样式（包含图标和文本）
const ToastContentArea = styled('div', {
  name: 'MuiToast',
  slot: 'ContentArea',
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'flex-start',
  width: '100%',
}));

// 文本区域样式
const ToastTextArea = styled('div', {
  name: 'MuiToast',
  slot: 'TextArea',
})(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
}));

// 通知消息样式
const ToastMessage = styled(Typography, {
  name: 'MuiToast',
  slot: 'Message',
})(({ theme }) => ({
  fontWeight: 500,
}));

// 通知描述样式
const ToastDescription = styled(Typography, {
  name: 'MuiToast',
  slot: 'Description',
})(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

// 关闭按钮样式
const CloseButton = styled(IconButton, {
  name: 'MuiToast',
  slot: 'CloseButton',
})(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  padding: theme.spacing(0.5),
}));

// 操作按钮样式
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

  // 操作按钮点击处理
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

  // 获取显示图标
  const displayIcon = icon || getDefaultIcon(type);

  // 通知元素被挂载后，测量并报告高度
  React.useEffect(() => {
    const toastNode = toastRef.current;
    if (toastNode && ownerState.id) {
      const height = toastNode.getBoundingClientRect().height;
      if (typeof ownerState.onHeightChange === 'function') {
        console.log('height', height);
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

  // 处理动画结束事件
  const handleAnimationEnd = React.useCallback(
    (e: React.AnimationEvent<HTMLLIElement>) => {
      if (onAnimationEnd) {
        onAnimationEnd();
      }
    },
    [onAnimationEnd, ownerState.id, ownerState.isDeleting],
  );

  // 如果有自定义内容，则直接渲染
  if (customContent) {
    return (
      <ToastRoot
        ref={ref}
        className={`${classes.root} ${className || ''}`}
        ownerState={ownerState as ToastOwnerState}
        animation={animation}
        style={style}
        onAnimationEnd={handleAnimationEnd}
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
              aria-label="关闭通知"
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
      onAnimationEnd={handleAnimationEnd}
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
            aria-label="关闭通知"
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

export default Toast;
