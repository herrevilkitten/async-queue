import { describe, it, expect } from "vitest";
import { AsyncQueue } from "./async-queue";

describe("AsyncQueue", () => {
  it("should add and retrieve an item", async () => {
    const queue = new AsyncQueue<number>();
    queue.add(1);
    const item = await queue.next();
    expect(item).toBe(1);
  });

  it("should wait for an item to be added", async () => {
    const queue = new AsyncQueue<string>();
    const promise = queue.next();
    queue.add("hello");
    const item = await promise;
    expect(item).toBe("hello");
  });

  it("should handle multiple items in order", async () => {
    const queue = new AsyncQueue<number>();
    queue.add(1);
    queue.add(2);
    queue.add(3);
    expect(await queue.next()).toBe(1);
    expect(await queue.next()).toBe(2);
    expect(await queue.next()).toBe(3);
  });

  it("should handle multiple next calls before adding items", async () => {
    const queue = new AsyncQueue<string>();
    const p1 = queue.next();
    const p2 = queue.next();
    const p3 = queue.next();
    queue.add("one");
    queue.add("two");
    queue.add("three");
    expect(await p1).toBe("one");
    expect(await p2).toBe("two");
    expect(await p3).toBe("three");
  });

  it("should correctly report its size", () => {
    const queue = new AsyncQueue<number>();
    expect(queue.size).toBe(0);
    queue.add(1);
    expect(queue.size).toBe(1);
    queue.add(2);
    expect(queue.size).toBe(2);
    queue.next();
    expect(queue.size).toBe(1);
    queue.next();
    expect(queue.size).toBe(0);
    queue.next(); // This creates a pending promise
    expect(queue.size).toBe(0);
    queue.add(10); // This resolves the pending promise
    expect(queue.size).toBe(0);
  });

  it("should handle a mix of add and next calls", async () => {
    const queue = new AsyncQueue<any>();
    queue.add(1);
    expect(await queue.next()).toBe(1);

    const p1 = queue.next();
    queue.add("hello");
    expect(await p1).toBe("hello");

    queue.add({ a: 1 });
    queue.add([1, 2]);
    expect(await queue.next()).toEqual({ a: 1 });
    expect(await queue.next()).toEqual([1, 2]);

    const p2 = queue.next();
    const p3 = queue.next();
    queue.add(true);
    queue.add(false);
    expect(await p2).toBe(true);
    expect(await p3).toBe(false);
  });

  it("should work with different data types", async () => {
    const queue = new AsyncQueue<any>();
    const obj = { key: "value" };
    const arr = [1, "two", true];
    const p = queue.next();
    queue.add(obj);
    expect(await p).toBe(obj);

    queue.add(arr);
    expect(await queue.next()).toBe(arr);
  });

  it("should resolve with a promise", async () => {
    const queue = new AsyncQueue<string>();
    const promise = new Promise<string>((resolve) =>
      setTimeout(() => resolve("from promise"), 10),
    );
    queue.add(promise);
    const item = await queue.next();
    expect(item).toBe("from promise");
  });
});
