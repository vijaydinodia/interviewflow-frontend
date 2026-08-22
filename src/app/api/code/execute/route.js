import { NextResponse } from "next/server";
import { executeCode, JUDGE0_LANGUAGES } from "@/lib/judge0";

/**
 * POST /api/code/execute
 * Executes user source code against Judge0 API
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { sourceCode, language, stdin = "" } = body;

    // 1. Validation
    if (!sourceCode || typeof sourceCode !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Source code is required.",
          status: { id: 13, description: "Validation Error" },
          stderr: "Source code cannot be empty.",
        },
        { status: 400 }
      );
    }

    if (!language || typeof language !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Programming language is required.",
          status: { id: 13, description: "Validation Error" },
          stderr: "Please specify a valid language (e.g. javascript, python, cpp, java, go, rust).",
        },
        { status: 400 }
      );
    }

    const langKey = language.toLowerCase();
    if (!JUDGE0_LANGUAGES[langKey]) {
      const supported = Object.keys(JUDGE0_LANGUAGES).join(", ");
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported language '${language}'. Supported languages: ${supported}`,
          status: { id: 13, description: "Unsupported Language" },
          stderr: `Language '${language}' is not supported. Supported: ${supported}`,
        },
        { status: 400 }
      );
    }

    // 2. Execute code via Judge0 utility
    const result = await executeCode({
      sourceCode,
      language: langKey,
      stdin,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Code execution error:", error.message);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to execute code.",
        status: { id: 13, description: "Execution Engine Error" },
        stdout: "",
        stderr: error.message || "Remote code execution engine failed.",
        compile_output: "",
        time: "0.000s",
        memory: "0 KB",
      },
      { status: 500 }
    );
  }
}
