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
   * @returns A promise that will be resolved with the next item in the queue.
   */
  next() {
    return new Promise<T>((resolve) => {
      const data = this.list.shift();
      if (data) {
        resolve(data);
      } else {
        this.resolveList.push(resolve);
      }
    });
  }

  /**
   * The number of items waiting to be processed.
   */
  get size() {
    return this.list.length;
  }
}
