import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Cached memory cache for fast response times
let cachedQuestions = null;

function loadQuestions() {
  if (cachedQuestions) return cachedQuestions;

  const possiblePaths = [
    path.join(process.cwd(), "../interviewflow-backend/data/leetcode_questions_1000.json"),
    path.join(process.cwd(), "src/data/leetcode_questions_1000.json"),
    "C:/Users/acer/Desktop/InterviewFlow/interviewflow-backend/data/leetcode_questions_1000.json",
  ];

  for (const filePath of possiblePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, "utf-8");
        cachedQuestions = JSON.parse(fileData);
        return cachedQuestions;
      }
    } catch (err) {
      console.error(`Error reading ${filePath}:`, err.message);
    }
  }

  return [];
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search")?.toLowerCase();
    const tag = searchParams.get("tag")?.toLowerCase();

    let questions = loadQuestions();

    if (difficulty && difficulty !== "all") {
      questions = questions.filter(
        (q) => q.difficulty?.toLowerCase() === difficulty.toLowerCase()
      );
    }

    if (search) {
      questions = questions.filter(
        (q) =>
          q.title?.toLowerCase().includes(search) ||
          q.frontendId?.toString().includes(search) ||
          q.topicTags?.some((t) => t.name?.toLowerCase().includes(search))
      );
    }

    if (tag) {
      questions = questions.filter((q) =>
        q.topicTags?.some((t) => t.slug?.toLowerCase() === tag || t.name?.toLowerCase() === tag)
      );
    }

    return NextResponse.json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error("GET /api/questions error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to load questions.", error: error.message },
      { status: 500 }
    );
  }
}
