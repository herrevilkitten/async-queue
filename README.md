# @herrevilkitten/async-queue

A simple, zero-dependency, asynchronous queue for TypeScript and JavaScript projects. This package provides a way to manage and process items in a first-in, first-out (FIFO) manner, especially in asynchronous workflows.

[![npm version](https://badge.fury.io/js/%40herrevilkitten%2Fasync-queue.svg)](https://badge.fury.io/js/%40herrevilkitten%2Fasync-queue)

## Features

- **Asynchronous by Design**: Use `async/await` to add and retrieve items from the queue.
- **TypeScript Support**: Fully typed for a great developer experience.
- **Zero Dependencies**: Lightweight and easy to integrate.
- **Dual Module Support**: Works seamlessly with both ESM (`import`) and CommonJS (`require`).

## Installation

You can install the package using your favorite package manager:

**npm:**

```bash
npm install @herrevilkitten/async-queue
```

**pnpm:**

```bash
pnpm add @herrevilkitten/async-queue
```

**yarn:**

```bash
yarn add @herrevilkitten/async-queue
```

## Usage

Here’s how you can use `@herrevilkitten/async-queue` in your project.

### ESM (import)

```typescript
import { AsyncQueue } from "@herrevilkitten/async-queue";

async function processTasks() {
  const taskQueue = new AsyncQueue<string>();

  // A consumer that processes tasks as they arrive
  const consumer = async () => {
    while (true) {
      const task = await taskQueue.next();
      console.log(`Processing: ${task}`);
      // Simulate async work
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log(`Finished: ${task}`);
    }
  };

  // Start the consumer
  consumer();

  // Add tasks to the queue
  console.log("Adding tasks to the queue...");
  taskQueue.add("Task 1");
  taskQueue.add("Task 2");
  taskQueue.add("Task 3");
}

processTasks();
```

### CommonJS (require)

```javascript
const { AsyncQueue } = require("@herrevilkitten/async-queue");

async function manageJobs() {
  const jobQueue = new AsyncQueue();

  // A worker that waits for jobs
  const worker = async (id) => {
    console.log(`Worker ${id} is waiting for a job.`);
    const job = await jobQueue.next();
    console.log(`Worker ${id} is processing job: ${job}`);
  };

  // Start multiple workers
  worker(1);
  worker(2);

  // Add jobs to the queue
  setTimeout(() => {
    console.log("Adding new jobs...");
    jobQueue.add("Job A");
    jobQueue.add("Job B");
  }, 1000);
}

manageJobs();
```

## Usage with the built-in Async Iterator

`AsyncQueue` has a built-in async iterator, which allows you to use it directly in a `for await...of` loop. This is the simplest way to consume items from the queue.

The loop will automatically wait for new items to arrive and will terminate when the queue is cleared via the `.clear()` method.

```typescript
import { AsyncQueue } from "@herrevilkitten/async-queue";

async function consumeWithIterator() {
  const queue = new AsyncQueue<string>();

  // Add items to the queue in the background
  setTimeout(() => {
    queue.add("Message 1");
    queue.add("Message 2");
    queue.add("Message 3");
    queue.clear(); // This will cause the for await...of loop to finish
  }, 500);

  console.log("Consumer is waiting for messages...");

  // Consume items from the queue as they arrive
  for await (const message of queue) {
    console.log(`Consumed: ${message}`);
  }

  console.log("Consumer has finished.");
}

consumeWithIterator();
```

This approach is recommended for most use cases as it is more concise than creating a custom async generator.

## API

### `new AsyncQueue<T>(initial?: T[])`

Creates a new instance of the `AsyncQueue`.

- `T` (optional): The generic type `T` defines the type of items the queue will hold.
- `initial` (optional): An initial list of items to add to the queue.

### `.add(data: T)`

Adds an item to the queue. If a consumer is already waiting on `.next()`, the promise will resolve with this item immediately. Otherwise, the item is stored in the queue.

- `data`: The item to add to the queue.

### `.next(timeout?: number): Promise<T>`

Returns a promise that resolves with the next item in the queue. If the queue is empty, it waits until a new item is added.

- `timeout` (optional): The number of milliseconds to wait before rejecting the promise with a timeout error.

### `.peek(): T | undefined`

Returns the next item in the queue without removing it. Returns `undefined` if the queue is empty.

### `.size: number`

A getter that returns the number of items currently in the queue. This does not include consumers waiting for items.

### `.isEmpty: boolean`

A getter that returns `true` if the queue is empty, and `false` otherwise.

### `.clear()`

Clears all items from the queue and rejects any pending promises from `.next()` calls.

### `[Symbol.asyncIterator](): AsyncIterator<T>`

Returns the built-in async iterator for the queue, allowing it to be used directly in `for await...of` loops. The loop will terminate when `.clear()` is called.

## License

This project is licensed under the ISC License.
