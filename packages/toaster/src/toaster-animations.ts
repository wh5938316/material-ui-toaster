import { keyframes } from '@mui/material/styles';

// Swipe out upward animation
export const swipeOutUp = keyframes`
  from {
    transform: translateY(var(--swipe-amount-y)) scale(var(--scale, 1));
    opacity: 1;
    will-change: transform, opacity;
  }

  to {
    transform: translateY(calc(var(--swipe-amount-y) - 100%)) scale(var(--scale, 1));
    opacity: 0;
    will-change: transform, opacity;
  }
`;

// Swipe out downward animation
export const swipeOutDown = keyframes`
  from {
    transform: translateY(var(--swipe-amount-y)) scale(var(--scale, 1));
    opacity: 1;
    will-change: transform, opacity;
  }

  to {
    transform: translateY(calc(var(--swipe-amount-y) + 100%)) scale(var(--scale, 1));
    opacity: 0;
    will-change: transform, opacity;
  }
`;

// Swipe in upward animation
export const swipeInUp = keyframes`
  from {
    transform: translateY(calc(var(--swipe-amount-y) + 100%)) scale(var(--scale, 1));
    opacity: 0;
    will-change: transform, opacity;
  }

  to {
    transform: translateY(var(--swipe-amount-y)) scale(var(--scale, 1));
    opacity: 1;
    will-change: transform, opacity;
  }
`;

// Swipe in downward animation
export const swipeInDown = keyframes`
  from {
    transform: translateY(calc(var(--swipe-amount-y) - 100%)) scale(var(--scale, 1));
    opacity: 0;
    will-change: transform, opacity;
  }

  to {
    transform: translateY(var(--swipe-amount-y)) scale(var(--scale, 1));
    opacity: 1;
    will-change: transform, opacity;
  }
`;
