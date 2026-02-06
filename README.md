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

## API

### `new AsyncQueue<T>()`

Creates a new instance of the `AsyncQueue`. The generic type `T` defines the type of items the queue will hold.

### `.add(data: T | PromiseLike<T>)`

Adds an item to the queue. If a consumer is already waiting on `.next()`, the promise will resolve with this item immediately. Otherwise, the item is stored in the queue.

- `data`: The item to add to the queue. It can be a value or a promise.

### `.next(): Promise<T>`

Returns a promise that resolves with the next item in the queue. If the queue is empty, it waits until a new item is added.

### `.size: number`

A getter that returns the number of items currently in the queue. This does not include consumers waiting for items.

## License

This project is licensed under the ISC License.
