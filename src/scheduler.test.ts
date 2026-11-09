import { test } from "node:test";
import assert from "node:assert/strict";
import { runEvery } from "./scheduler";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

test("runEvery never runs the task concurrently, even when it overruns", async () => {
  let running = 0;
  let maxConcurrent = 0;
  let runs = 0;
  let overruns = 0;

  const stop = runEvery(
    async () => {
      running++;
      runs++;
      maxConcurrent = Math.max(maxConcurrent, running);
      await sleep(30); // longer than the 10ms interval
      running--;
    },
    10,
    () => overruns++
  );

  await sleep(150);
  stop();
  await sleep(40); // let any in-flight run finish

  assert.equal(maxConcurrent, 1);
  assert.ok(runs >= 2, `expected multiple runs, got ${runs}`);
  assert.ok(overruns >= 1, "expected overrun callback to fire");
});

test("runEvery keeps going after the task throws", async () => {
  let runs = 0;
  const originalError = console.error;
  console.error = () => {};
  try {
    const stop = runEvery(async () => {
      runs++;
      throw new Error("boom");
    }, 5);
    await sleep(40);
    stop();
  } finally {
    console.error = originalError;
  }
  assert.ok(runs >= 2, `expected the loop to continue, got ${runs} runs`);
});

test("stop prevents further runs", async () => {
  let runs = 0;
  const stop = runEvery(async () => {
    runs++;
  }, 5);
  await sleep(1);
  stop();
  const after = runs;
  await sleep(30);
  assert.equal(runs, after);
});
