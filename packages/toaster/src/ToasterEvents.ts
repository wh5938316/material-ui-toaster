// 定义Toast数据类型
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
  // 新增属性
  icon?: React.ReactNode;
  actionLabel?: string;
  actionClick?: () => void | Promise<any>;
  actionLoading?: boolean;
  customContent?: React.ReactNode;
  // Promise相关属性
  promisePending?: boolean;
  promiseState?: 'pending' | 'fulfilled' | 'rejected';
}

// 定义要删除的Toast类型
export type ToastToDismiss = { id: number; dismiss: boolean };

// 定义事件类型
export type ToasterEvents = {
  toast: ToastData | ToastToDismiss;
  clear: void;
};

// 创建全局事件处理器
type Listener = (data: ToastData | ToastToDismiss) => void;
type ClearListener = () => void;

// 简化的事件系统
class ToasterEventSystem {
  private listeners: Listener[] = [];
  private clearListeners: ClearListener[] = [];
  private toastId = 0;

  // 添加Toast
  toast(toast: Omit<ToastData, 'id'>): number {
    const id = ++this.toastId;
    const newToast = { id, ...toast, position: Date.now() } as ToastData;

    this.notifyListeners(newToast);
    return id;
  }

  // 添加各类型Toast的快捷方法
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
   * 创建带操作按钮的Toast
   * @param message 通知消息
   * @param actionLabel 按钮文本
   * @param actionClick 按钮点击处理函数
   * @param options 其他选项，包括成功和失败时的消息
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

          // 操作成功，更新为成功状态
          this.notifyListeners({
            id,
            message: options?.success || '操作成功',
            type: 'success',
            actionLabel: undefined, // 移除按钮
            actionClick: undefined, // 移除点击处理函数
            actionLoading: false,
          } as ToastData);

          return result;
        } catch (error) {
          // 操作失败，更新为错误状态
          this.notifyListeners({
            id,
            message: options?.error || '操作失败',
            description: error instanceof Error ? error.message : undefined,
            type: 'error',
            actionLabel: undefined, // 移除按钮
            actionClick: undefined, // 移除点击处理函数
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
   * 创建基于Promise的Toast
   * @param message 初始消息
   * @param promise Promise对象
   * @param options 配置选项，包括成功和失败时的消息
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

    // 修改Promise检查的逻辑
    if (typeof promise !== 'object' || typeof promise.then !== 'function') {
      console.error('ToasterEvents.promise: 参数必须是Promise实例');
      return this.error('操作失败：参数类型错误');
    }

    const id = this.toast({
      message: loadingMessage,
      type: 'info',
      promisePending: true,
      promiseState: 'pending',
      ...(options?.type || {}),
    });

    // 不允许自动关闭，直到Promise完成
    let isClosed = false;

    // 处理Promise完成
    promise
      .then((data) => {
        if (isClosed) return;

        let successMessage: React.ReactNode;
        if (typeof options?.success === 'function') {
          successMessage = (options.success as Function)(data);
        } else {
          successMessage = options?.success || '操作成功';
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
          errorMessage = options?.error || '操作失败';
        }

        this.notifyListeners({
          id,
          message: errorMessage,
          type: 'error',
          promisePending: false,
          promiseState: 'rejected',
        } as ToastData);
      });

    // 移除这个错误的部分，不再尝试给id添加close方法
    // 直接返回id即可
    return id;
  }

  /**
   * 创建自定义内容的Toast
   * @param content 自定义React节点
   * @param options 其他选项
   * @returns Toast ID
   */
  custom(
    content: React.ReactNode,
    options?: Omit<ToastData, 'id' | 'message' | 'customContent'>,
  ): number {
    return this.toast({
      message: '', // 自定义内容时，message可以为空
      customContent: content,
      ...options,
    });
  }

  // 删除指定ID的Toast
  dismiss(id: number) {
    this.notifyListeners({ id, dismiss: true });
  }

  // 清除所有Toast
  clear() {
    this.notifyClearListeners();
  }

  // 通知所有监听器
  private notifyListeners(data: ToastData | ToastToDismiss) {
    this.listeners.forEach((listener) => {
      try {
        listener(data);
      } catch (err) {
        console.error('Toast listener error:', err);
      }
    });
  }

  // 通知所有清除监听器
  private notifyClearListeners() {
    this.clearListeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Clear listener error:', err);
      }
    });
  }

  // 订阅事件
  subscribe(callback: (data: ToastData | ToastToDismiss) => void) {
    this.listeners.push(callback);

    // 返回取消订阅函数
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback);
    };
  }

  // 订阅清除事件
  onClear(callback: () => void) {
    this.clearListeners.push(callback);

    // 返回取消订阅函数
    return () => {
      this.clearListeners = this.clearListeners.filter((listener) => listener !== callback);
    };
  }
}

// 创建单例实例
export const ToasterEvents = new ToasterEventSystem();

// 导出默认实例
export default ToasterEvents;
