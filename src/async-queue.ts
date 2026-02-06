/**
 * A function type for resolving promises.
 * @template T The type of data to resolve.
 * @param data The data or a promise that resolves to the data.
 */
export type ResolverFn<T> = (data: T | PromiseLike<T>) => void;

/**
 * A class for creating an async queue.
 * @template T The type of data to store.
 */
export class AsyncQueue<T> {
  private readonly list: T[] = [];
  private readonly resolveList: ResolverFn<T>[] = [];
  private readonly rejectList: ((reason?: any) => void)[] = [];

  /**
   * Creates an async queue.
   * @param initial The initial list of items to add to the queue.
   */
  constructor(initial?: T[]) {
    if (initial) {
      this.list.push(...initial);
    }
  }

  /**
   * Adds data to the queue. If there is a pending promise,
   * it will be resolved with the data. Otherwise, the data will be
   * added to the list.
   * @param data The data to add.
   */
  add(data: T) {
    if (this.resolveList.length > 0) {
      const resolve = this.resolveList.shift();
      if (resolve) {
        resolve(data);
      }
    } else {
      this.list.push(data);
    }
  }

  /**
   * Returns a promise that will be resolved with the next item in the queue.
   * If there is data in the list, the promise will be
   * resolved with the first item in the list. Otherwise, the
   * promise will be added to the resolve list and will be resolved
   * when new data is added.
   * @param timeout The number of milliseconds to wait before rejecting the
   * promise with a timeout error.
   * @returns A promise that will be resolved with the next item in the queue.
   */
  next(timeout?: number) {
    return new Promise<T>((resolve, reject) => {
      const data = this.list.shift();
      if (data) {
        resolve(data);
      } else {
        this.resolveList.push(resolve);
        this.rejectList.push(reject);
        if (timeout) {
          setTimeout(() => {
            const index = this.resolveList.indexOf(resolve);
            if (index > -1) {
              this.resolveList.splice(index, 1);
              this.rejectList.splice(index, 1);
              reject(new Error("Timeout"));
            }
          }, timeout);
        }
      }
    });
  }

  /**
   * Returns the next item in the queue without removing it.
   * @returns The next item in the queue or undefined if the queue is empty.
   */
  peek() {
    return this.list[0];
  }

  /**
   * The number of items waiting to be processed.
   */
  get size() {
    return this.list.length;
  }

  /**
   * Whether the queue is empty.
   */
  get isEmpty() {
    return this.list.length === 0;
  }

  /**
   * Clears the queue.
   */
  clear() {
    this.list.length = 0;
    this.rejectList.forEach((reject) => reject(new Error("Queue cleared")));
    this.resolveList.length = 0;
    this.rejectList.length = 0;
  }
}
