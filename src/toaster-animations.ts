import { keyframes } from '@mui/material/styles';

// 向上滑出动画
export const swipeOutUp = keyframes`
  from {
    transform: translateY(var(--swipe-amount-y));
    opacity: 1;
  }

  to {
    transform: translateY(calc(var(--swipe-amount-y) - 100%));
    opacity: 0;
  }
`;

// 向下滑出动画
export const swipeOutDown = keyframes`
  from {
    transform: translateY(var(--swipe-amount-y));
    opacity: 1;
  }

  to {
    transform: translateY(calc(var(--swipe-amount-y) + 100%));
    opacity: 0;
  }
`;

// 向上滑入动画
export const swipeInUp = keyframes`
  from {
    transform: translateY(calc(var(--swipe-amount-y) + 100%));
    opacity: 0;
  }

  to {
    transform: translateY(var(--swipe-amount-y));
    opacity: 1;
  }
`;

// 向下滑入动画
export const swipeInDown = keyframes`
  from {
    transform: translateY(calc(var(--swipe-amount-y) - 100%));
    opacity: 0;
  }

  to {
    transform: translateY(var(--swipe-amount-y));
    opacity: 1;
  }
`;
