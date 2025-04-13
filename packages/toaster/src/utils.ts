class Timer {
  private timerId: NodeJS.Timeout | null = null;
  private start: number;
  private remaining: number;
  private callback: () => void;

  constructor(callback: () => void, delay: number) {
    this.callback = callback;
    this.remaining = delay;
    this.start = Date.now();
    this.timerId = setTimeout(this.callback, this.remaining);
  }

  pause(): void {
    console.log('pause', this.timerId);
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
      this.remaining -= Date.now() - this.start;
    }
  }

  resume(): void {
    console.log('resume', this.timerId);
    if (this.timerId) {
      return;
    }
    this.start = Date.now();
    this.timerId = setTimeout(this.callback, this.remaining);
  }

  clear(): void {
    if (this.timerId) {
      clearTimeout(this.timerId);
    }
  }
}

export { Timer };
