import type { IncomingMessage, ServerResponse } from "node:http";
import { generateStudy, StudyError, validateInput } from "../server/study.ts";

const requests = new Map<string, { count: number; until: number }>();
export function resetRequestLimitsForTests() {
  requests.clear();
}
async function readBody(request: IncomingMessage & { body?: unknown }) {
  if (request.body !== undefined) {
    if (JSON.stringify(request.body).length > 200000)
      throw new StudyError(
        413,
        "This material is too large. Please use a shorter excerpt.",
      );
    if (typeof request.body === "string") {
      try {
        return JSON.parse(request.body);
      } catch {
        throw new StudyError(
          400,
          "The request could not be read. Please try again.",
        );
      }
    }
    return request.body;
  }
  let size = 0;
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += bytes.length;
    if (size > 200000)
      throw new StudyError(
        413,
        "This material is too large. Please use a shorter excerpt.",
      );
    chunks.push(bytes);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw new StudyError(
      400,
      "The request could not be read. Please try again.",
    );
  }
}
export default async function handler(
  request: IncomingMessage & { body?: unknown },
  response: ServerResponse,
) {
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("X-Content-Type-Options", "nosniff");
  const reply = (status: number, data: unknown) => {
    response.statusCode = status;
    response.end(JSON.stringify(data));
  };
  if (request.method === "GET") {
    reply(200, { available: !!process.env.GEMINI_API_KEY });
    return;
  }
  if (request.method !== "POST") {
    response.setHeader("Allow", "GET, POST");
    reply(405, { error: "This method is not supported." });
    return;
  }
  const origin = request.headers.origin;
  if (origin) {
    try {
      if (new URL(origin).host !== request.headers.host) {
        reply(403, {
          error: "Please use the assistant from the library website.",
        });
        return;
      }
    } catch {
      reply(403, { error: "Invalid request origin." });
      return;
    }
  }
  if (!request.headers["content-type"]?.startsWith("application/json")) {
    reply(415, { error: "The assistant expects a JSON request." });
    return;
  }
  try {
    const input = await readBody(request);
    validateInput(input);
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      reply(503, {
        error: "The Study Assistant is being set up. Please try again later.",
      });
      return;
    }
    const now = Date.now();
    for (const [id, item] of requests)
      if (item.until <= now) requests.delete(id);
    const address = String(
      request.headers["x-vercel-forwarded-for"] ||
        request.socket.remoteAddress ||
        "unknown",
    );
    const limit = requests.get(address) || { count: 0, until: now + 60000 };
    if (limit.count >= 6 || (requests.size >= 1000 && !requests.has(address))) {
      response.setHeader("Retry-After", "60");
      reply(429, {
        error: "Please wait a minute before generating more study material.",
      });
      return;
    }
    limit.count++;
    requests.set(address, limit);
    const cancellation = new AbortController();
    response.once("close", () => cancellation.abort());
    const result = await generateStudy(input, {
      signal: cancellation.signal,
      key,
      model: process.env.STUDY_AI_MODEL,
    });
    reply(200, result);
  } catch (error) {
    reply(error instanceof StudyError ? error.status : 500, {
      error:
        error instanceof StudyError
          ? error.message
          : "Something went wrong. Please try again.",
    });
  }
}
