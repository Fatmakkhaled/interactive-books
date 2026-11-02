import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import {
  generateStudy,
  makeSources,
  validateContent,
  validateInput,
  StudyError,
} from "../server/study.ts";
import handler, { resetRequestLimitsForTests } from "../api/study.ts";

const notes =
  "A variable stores a value. A loop repeats instructions while its condition holds. Functions group reusable instructions and may return a result. An algorithm describes a finite sequence of steps to solve a problem.";
const input = { mode: "summary", notes, courseCode: "CF117", question: "" };
const content = {
  title: "Programming concepts",
  overview: "A study guide from the notes.",
  sections: [
    {
      heading: "Variables",
      body: "A variable stores a value.",
      sourceIds: [1],
    },
  ],
  flashcards: [],
  quiz: [],
  missingInformation: [],
};
function upstream(value: unknown = content) {
  return new Response(
    JSON.stringify({
      status: "completed",
      output: [
        {
          type: "message",
          content: [{ type: "output_text", text: JSON.stringify(value) }],
        },
      ],
    }),
    { status: 200 },
  );
}

test("validates mode, source bounds, course membership, and question requirements", () => {
  assert.equal(
    validateInput(input).course,
    "CF117: Introduction to Programming",
  );
  for (const value of [
    { ...input, notes: "short" },
    { ...input, notes: "x".repeat(30001) },
    { ...input, mode: "admin" },
    { ...input, courseCode: "fake" },
    { ...input, mode: "answer", question: "x" },
    { ...input, question: "x".repeat(1001) },
  ])
    assert.throws(() => validateInput(value), StudyError);
});
test("chunks preserve all source text with bounded numbered references", () => {
  const material = notes.repeat(100);
  const sources = makeSources(material);
  assert.ok(sources.length > 1);
  assert.ok(
    sources.every(
      (source, index) => source.id === index + 1 && source.text.length <= 1200,
    ),
  );
  assert.equal(
    sources
      .map((source) => source.text)
      .join("")
      .replace(/\s/g, ""),
    material.replace(/\s/g, ""),
  );
});
test("sends a grounded structured request with no provider storage and an output budget", async () => {
  let called = false;
  const result = await generateStudy(input, {
    key: "test-only-not-a-real-key",
    fetcher: async (url, options) => {
      called = true;
      assert.equal(url, "https://api.openai.com/v1/responses");
      const body = JSON.parse(String(options?.body));
      assert.equal(body.store, false);
      assert.equal(body.max_output_tokens, 4500);
      assert.equal(body.text.format.strict, true);
      assert.match(body.instructions, /untrusted source data/);
      assert.match(body.input, /A variable stores/);
      return upstream();
    },
  });
  assert.equal(called, true);
  assert.equal(result.title, content.title);
  assert.equal(result.sources[0].text, notes);
});
test("rejects unknown citations, incomplete results, and invalid quiz answers", () => {
  const sources = makeSources(notes);
  assert.throws(() =>
    validateContent(
      { ...content, sections: [{ ...content.sections[0], sourceIds: [99] }] },
      sources,
      "summary",
    ),
  );
  assert.throws(() =>
    validateContent({ ...content, sections: [] }, sources, "summary"),
  );
  assert.throws(() =>
    validateContent(
      {
        ...content,
        quiz: [
          {
            question: "Q",
            options: ["A", "B", "C", "D"],
            answerIndex: 8,
            explanation: "E",
            sourceIds: [1],
          },
        ],
      },
      sources,
      "quiz",
    ),
  );
  assert.throws(() =>
    validateContent(
      {
        ...content,
        quiz: [
          {
            question: "Q",
            options: ["A", "A", "C", "D"],
            answerIndex: 1,
            explanation: "E",
            sourceIds: [1],
          },
        ],
      },
      sources,
      "quiz",
    ),
  );
});
test("allows an honest report when source material cannot support an answer", () => {
  const result = validateContent(
    {
      ...content,
      sections: [],
      missingInformation: ["The notes do not explain recursion."],
    },
    makeSources(notes),
    "answer",
  );
  assert.equal(result.sections.length, 0);
  assert.equal(result.missingInformation.length, 1);
});
test("maps provider failures without leaking details or credentials", async () => {
  for (const [status, expected] of [
    [401, 503],
    [403, 503],
    [429, 429],
    [500, 502],
  ]) {
    await assert.rejects(
      generateStudy(input, {
        key: "test-only",
        fetcher: async () =>
          new Response("sensitive provider details", { status }),
      }),
      (error) =>
        error instanceof StudyError &&
        error.status === expected &&
        !error.message.includes("sensitive"),
    );
  }
});
test("rejects truncated, refused, and malformed provider responses", async () => {
  for (const payload of [
    { status: "incomplete", output: [] },
    {
      status: "completed",
      output: [{ content: [{ type: "refusal", refusal: "No" }] }],
    },
    {
      status: "completed",
      output: [{ content: [{ type: "output_text", text: "invalid json" }] }],
    },
  ]) {
    await assert.rejects(
      generateStudy(input, {
        key: "test-only",
        fetcher: async () => new Response(JSON.stringify(payload)),
      }),
      StudyError,
    );
  }
});
test("connection failures return a recoverable error", async () => {
  await assert.rejects(
    generateStudy(input, {
      key: "test-only",
      fetcher: async () => {
        throw new Error("private failure");
      },
    }),
    (error) =>
      error instanceof StudyError &&
      error.status === 504 &&
      !error.message.includes("private"),
  );
});
test("HTTP endpoint handles missing setup, validation, success, origin checks, and request limits", async (t) => {
  const previousKey = process.env.STUDY_AI_API_KEY;
  const previousFetch = globalThis.fetch;
  delete process.env.STUDY_AI_API_KEY;
  const server = createServer((request, response) => {
    void handler(request, response);
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const url = `http://127.0.0.1:${address.port}`;
  t.after(async () => {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.STUDY_AI_API_KEY;
    else process.env.STUDY_AI_API_KEY = previousKey;
    resetRequestLimitsForTests();
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  });
  const call = (data: unknown = input, extra: Record<string, string> = {}) =>
    previousFetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...extra },
      body: JSON.stringify(data),
    });
  let response = await previousFetch(url);
  assert.deepEqual(await response.json(), { available: false });
  response = await call();
  assert.equal(response.status, 503);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal((await call({ ...input, notes: "tiny" })).status, 400);
  assert.equal(
    (await call(input, { Origin: "https://unrelated.example" })).status,
    403,
  );
  assert.equal((await previousFetch(url, { method: "DELETE" })).status, 405);
  assert.equal(
    (await previousFetch(url, { method: "POST", body: "not-json" })).status,
    415,
  );
  assert.equal(
    (
      await previousFetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "bad json",
      })
    ).status,
    400,
  );
  assert.equal(
    (await call({ ...input, notes: "x".repeat(210000) })).status,
    413,
  );
  process.env.STUDY_AI_API_KEY = "test-only-not-a-real-key";
  globalThis.fetch = async () => upstream();
  response = await previousFetch(url);
  assert.deepEqual(await response.json(), { available: true });
  resetRequestLimitsForTests();
  for (let index = 0; index < 6; index++) {
    response = await call();
    assert.equal(response.status, 200);
    assert.equal((await response.json()).sources[0].text, notes);
  }
  response = await call();
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "60");
});
