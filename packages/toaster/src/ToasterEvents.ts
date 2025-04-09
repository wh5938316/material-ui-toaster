// Define Toast data type
export interface ToastData {
  id: number;
  message: React.ReactNode;
  description?: React.ReactNode;
  type?: 'info' | 'success' | 'warning' | 'error' | 'default';
  duration?: number;
  onClose?: () => void;
  position?: number;
  delete?: boolean;
  height?: number;
  icon?: React.ReactNode;
  actionLabel?: string;
  actionClick?: () => void | Promise<any>;
  actionLoading?: boolean;
  customContent?: React.ReactNode;
  // Promise-related properties
  promisePending?: boolean;
  promiseState?: 'pending' | 'fulfilled' | 'rejected';
}

// Define type for Toast to dismiss
export type ToastToDismiss = { id: number; dismiss: boolean };

// Define event types
export type ToasterEvents = {
  toast: ToastData | ToastToDismiss;
  clear: void;
};

// Create global event handler
type Listener = (data: ToastData | ToastToDismiss) => void;
type ClearListener = () => void;

// Simplified event system
class ToasterEventSystem {
  private listeners: Listener[] = [];
  private clearListeners: ClearListener[] = [];
  private toastId = 0;

  // Add Toast
  toast(toast: Omit<ToastData, 'id'>): number {
    const id = ++this.toastId;
    const newToast = { id, ...toast, position: Date.now() } as ToastData;

    this.notifyListeners(newToast);
    return id;
  }

  // Shortcut methods for different types of Toast
  success(message: React.ReactNode, options?: Omit<ToastData, 'id' | 'message' | 'type'>) {
    return this.toast({ message, type: 'success', ...options });
  }

  error(message: React.ReactNode, options?: Omit<ToastData, 'id' | 'message' | 'type'>) {
    return this.toast({ message, type: 'error', ...options });
  }

  info(message: React.ReactNode, options?: Omit<ToastData, 'id' | 'message' | 'type'>) {
    return this.toast({ message, type: 'info', ...options });
  }

  warning(message: React.ReactNode, options?: Omit<ToastData, 'id' | 'message' | 'type'>) {
    return this.toast({ message, type: 'warning', ...options });
  }

  /**
   * Create Toast with action button
   * @param message Notification message
   * @param actionLabel Button text
   * @param actionClick Button click handler
   * @param options Other options, including success and failure messages
   * @returns Toast ID
   */
  action(
    message: React.ReactNode,
    actionLabel: string,
    actionClick: () => void | Promise<any>,
    options?: {
      success?: React.ReactNode;
      error?: React.ReactNode;
      description?: React.ReactNode;
      type?: 'info' | 'warning' | 'default';
      duration?: number;
      icon?: React.ReactNode;
    },
  ): number {
    const id = this.toast({
      message,
      actionLabel,
      actionClick: async () => {
        try {
          const result = await actionClick();

          // Operation successful, update to success state
          this.notifyListeners({
            id,
            message: options?.success || 'Operation successful',
            type: 'success',
            actionLabel: undefined, // Remove button
            actionClick: undefined, // Remove click handler
            actionLoading: false,
          } as ToastData);

          return result;
        } catch (error) {
          // Operation failed, update to error state
          this.notifyListeners({
            id,
            message: options?.error || 'Operation failed',
            description: error instanceof Error ? error.message : undefined,
            type: 'error',
            actionLabel: undefined, // Remove button
            actionClick: undefined, // Remove click handler
            actionLoading: false,
          } as ToastData);

          throw error;
        }
      },
      description: options?.description,
      type: options?.type || 'default',
      duration: options?.duration,
      icon: options?.icon,
    });

    return id;
  }

  /**
   * Create Promise-based Toast
   * @param message Initial message
   * @param promise Promise object
   * @param options Configuration options, including success and failure messages
   * @returns Toast ID
   */
  promise<T>(
    message: React.ReactNode,
    promise: Promise<T>,
    options?: {
      loading?: React.ReactNode;
      success?: React.ReactNode | ((data: T) => React.ReactNode);
      error?: React.ReactNode | ((error: any) => React.ReactNode);
      type?: Omit<ToastData, 'id' | 'message'>;
    },
  ): number {
    const loadingMessage = options?.loading || message;

    // Modify Promise checking logic
    if (typeof promise !== 'object' || typeof promise.then !== 'function') {
      console.error('ToasterEvents.promise: Parameter must be a Promise instance');
      return this.error('Operation failed: Parameter type error');
    }

    const id = this.toast({
      message: loadingMessage,
      type: 'info',
      promisePending: true,
      promiseState: 'pending',
      ...(options?.type || {}),
    });

    // Do not allow auto-close until Promise completes
    let isClosed = false;

    // Handle Promise completion
    promise
      .then((data) => {
        if (isClosed) return;

        let successMessage: React.ReactNode;
        if (typeof options?.success === 'function') {
          successMessage = (options.success as Function)(data);
        } else {
          successMessage = options?.success || 'Operation successful';
        }

        this.notifyListeners({
          id,
          message: successMessage,
          type: 'success',
          promisePending: false,
          promiseState: 'fulfilled',
        } as ToastData);
      })
      .catch((error) => {
        if (isClosed) return;

        let errorMessage: React.ReactNode;
        if (typeof options?.error === 'function') {
          errorMessage = (options.error as Function)(error);
        } else {
          errorMessage = options?.error || 'Operation failed';
        }

        this.notifyListeners({
          id,
          message: errorMessage,
          type: 'error',
          promisePending: false,
          promiseState: 'rejected',
        } as ToastData);
      });

    // Remove this erroneous part, no longer try to add a close method to id
    // Just return the id
    return id;
  }

  /**
   * Create Toast with custom content
   * @param content Custom React node
   * @param options Other options
   * @returns Toast ID
   */
  custom(
    content: React.ReactNode,
    options?: Omit<ToastData, 'id' | 'message' | 'customContent'>,
  ): number {
    return this.toast({
      message: '', // Message can be empty with custom content
      customContent: content,
      ...options,
    });
  }

  // Delete Toast with specified ID
  dismiss(id: number) {
    this.notifyListeners({ id, dismiss: true });
  }

  // Clear all Toasts
  clear() {
    this.notifyClearListeners();
  }

  // Notify all listeners
  private notifyListeners(data: ToastData | ToastToDismiss) {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (err) {
        console.error('Toast listener error:', err);
      }
    });
  }

  // Notify all clear listeners
  private notifyClearListeners() {
    this.clearListeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Clear listener error:', err);
      }
    });
  }

  // Subscribe to events
  subscribe(callback: (data: ToastData | ToastToDismiss) => void) {
    this.listeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }

  // Subscribe to clear events
  onClear(callback: () => void) {
    this.clearListeners.push(callback);

    // Return unsubscribe function
    return () => {
      this.clearListeners = this.clearListeners.filter((listener) => listener !== callback);
    };
  }
}

// Create singleton instance
export const ToasterEvents = new ToasterEventSystem();

// Export default instance
export default ToasterEvents;
