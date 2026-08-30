import { NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    // Build query string from incoming params
    const params = new URLSearchParams();
    if (searchParams.get("difficulty")) params.set("difficulty", searchParams.get("difficulty"));
    if (searchParams.get("search")) params.set("search", searchParams.get("search"));
    if (searchParams.get("tag")) params.set("tag", searchParams.get("tag"));

    const queryStr = params.toString();
    const backendUrl = `${API_BASE}/questions${queryStr ? `?${queryStr}` : ""}`;

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET /api/questions proxy error:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to load questions.", error: error.message },
      { status: 500 }
    );
  }
}
