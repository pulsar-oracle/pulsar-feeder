import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { fetchJson } from "./http";

let server: http.Server;
let baseUrl: string;

before(async () => {
  server = http.createServer((req, res) => {
    if (req.url === "/ok") {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ price: "0.1234" }));
    } else if (req.url === "/error") {
      res.statusCode = 503;
      res.end();
    }
    // "/hang": never respond
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.closeAllConnections();
  server.close();
});

test("fetchJson parses a successful JSON response", async () => {
  const data = await fetchJson<{ price: string }>(`${baseUrl}/ok`, "Test");
  assert.deepEqual(data, { price: "0.1234" });
});

test("fetchJson rejects non-2xx responses with the source name", async () => {
  await assert.rejects(fetchJson(`${baseUrl}/error`, "Test"), {
    message: "Test request failed: 503",
  });
});

test("fetchJson times out when the server never responds", async () => {
  const started = Date.now();
  await assert.rejects(fetchJson(`${baseUrl}/hang`, "Test", 100), {
    message: "Test request timed out after 100ms",
  });
  assert.ok(Date.now() - started < 2_000, "should fail promptly");
});
