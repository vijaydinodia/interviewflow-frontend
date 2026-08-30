import { NextResponse } from "next/server";

/**
 * Supported languages — fixed whitelist mapped to Judge0 CE language IDs.
 * Free public instance: https://ce.judge0.com (no API key needed)
 */
const SUPPORTED_LANGUAGES = {
  63:  { name: "JavaScript (Node.js 12)" },
  71:  { name: "Python 3"                },
  62:  { name: "Java (OpenJDK 13)"        },
  50:  { name: "C (GCC 9)"               },
  54:  { name: "C++ (GCC 9)"             },
  74:  { name: "TypeScript"              },
};

function toBase64(str) {
  if (!str) return "";
  return Buffer.from(str, "utf8").toString("base64");
}

function fromBase64(str) {
  if (!str) return "";
  try {
    return Buffer.from(str, "base64").toString("utf8");
  } catch {
    return str;
  }
}

/**
 * POST /api/compiler/run
 * Body: { sourceCode: string, languageId: number, stdin?: string }
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { sourceCode, languageId, stdin } = body;

    // ── Validate sourceCode ────────────────────────────────────────────────
    if (!sourceCode || typeof sourceCode !== "string" || !sourceCode.trim()) {
      return NextResponse.json(
        { error: "sourceCode is required and cannot be empty." },
        { status: 400 }
      );
    }

    // ── Validate languageId ────────────────────────────────────────────────
    const id = Number(languageId);
    if (!id || !SUPPORTED_LANGUAGES[id]) {
      return NextResponse.json(
        { error: `Unsupported language ID: ${languageId}. Supported: ${Object.keys(SUPPORTED_LANGUAGES).join(", ")}` },
        { status: 400 }
      );
    }

    // ── Build request to Judge0 CE free public instance ───────────────────
    // https://ce.judge0.com — no API key required
    const judge0Url = (process.env.JUDGE0_API_URL || "https://ce.judge0.com").replace(/\/$/, "");

    const headers = {
      "Content-Type":  "application/json",
      "Accept":        "application/json",
    };

    // Only add auth if a key is explicitly set (future-proofing)
    const apiKey = process.env.JUDGE0_API_KEY;
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const payload = {
      source_code:    toBase64(sourceCode),
      language_id:    id,
      stdin:          toBase64(stdin || ""),
      cpu_time_limit: 5,
      memory_limit:   128000,
    };

    // ── Submit and wait (synchronous mode) ────────────────────────────────
    const submitRes = await axios.post(
      `${judge0Url}/submissions?base64_encoded=true&wait=true`,
      payload,
      {
        headers,
        timeout: 15000,
      }
    );

    let data = submitRes.data;

    // If the result is still queued / processing, poll once more
    if (data.token && data.status && data.status.id <= 2) {
      data = await pollToken(data.token, headers, judge0Url);
    }

    // ── Return clean result (no internals exposed) ─────────────────────────
    return NextResponse.json({
      status:          data.status         || { id: 3, description: "Accepted" },
      stdout:          fromBase64(data.stdout)         || "",
      stderr:          fromBase64(data.stderr)         || "",
      compile_output:  fromBase64(data.compile_output) || "",
      time:    data.time   ? `${parseFloat(data.time).toFixed(3)}s` : null,
      memory:  data.memory ? `${data.memory} KB`                    : null,
    });

  } catch (err) {
    // AbortError means our 15-second timeout fired
    if (err.code === "ECONNABORTED") {
      return NextResponse.json(
        { error: "Execution timed out. Please try again with shorter code." },
        { status: 504 }
      );
    }

    console.error("Compiler API error:", err.message);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

/** Poll once after 1.5 s if Judge0 returned a queued status */
async function pollToken(token, headers, baseUrl) {
  await new Promise((r) => setTimeout(r, 1500));
  try {
    const res = await axios.get(
      `${baseUrl}/submissions/${token}?base64_encoded=true`,
      { headers, timeout: 10000 }
    );
    if (res.status === 200) return res.data;
  } catch {
    // ignore — just return empty so caller handles gracefully
  }
  return {};
}
