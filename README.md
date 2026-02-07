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

## Usage with Async Generators

`AsyncQueue` can be combined with async generators. This allows you to create a stream of data that can be consumed by a `for await...of` loop.

Here's an example of how you might implement a `receive` method using an async generator:

```typescript
import { AsyncQueue } from "@herrevilkitten/async-queue";

class DataReceiver {
  private resolver = new AsyncQueue<string>();
  public connected = true;

  constructor() {
    // Simulate receiving data from a source and adding it to the queue
    let count = 1;
    const interval = setInterval(() => {
      if (!this.connected) {
        clearInterval(interval);
        return;
      }
      this.resolver.add(`Data packet ${count++}`);
    }, 500);
  }

  async *receive() {
    while (this.connected) {
      let result = await this.resolver.next();
      yield result;
    }
    return;
  }

  disconnect() {
    this.connected = false;
    this.resolver.clear(); // Clear queue and reject pending promises
  }
}

async function consumeStream() {
  const receiver = new DataReceiver();

  console.log("Starting to consume data stream...");
  let receivedCount = 0;

  for await (const data of receiver.receive()) {
    console.log(`Received: ${data}`);
    receivedCount++;
    if (receivedCount >= 3) {
      console.log("Disconnecting after 3 packets.");
      receiver.disconnect();
    }
  }

  console.log("Finished consuming data stream.");
}

consumeStream();
```

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

## License

This project is licensed under the ISC License.
