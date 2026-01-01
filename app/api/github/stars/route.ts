import { NextResponse } from "next/server";

const GITHUB_API_BASE = "https://api.github.com/repos";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function buildHeaders() {
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "OneURL",
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${GITHUB_TOKEN}`;
  }

  return headers;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const repo = searchParams.get("repo");

    if (!repo) {
      return NextResponse.json(
        { error: "Repository parameter is required" },
        { status: 400 }
      );
    }

    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) {
      return NextResponse.json(
        { error: "Invalid repository format. Expected: owner/repo" },
        { status: 400 }
      );
    }

    const response = await fetch(`${GITHUB_API_BASE}/${repo}`, {
      headers: buildHeaders(),
      next: {
        revalidate: 3600,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: "Repository not found" },
          { status: 404 }
        );
      }

      if (response.status === 403 || response.status === 429) {
        const rateLimitRemaining = response.headers.get("x-ratelimit-remaining");
        const rateLimitReset = response.headers.get("x-ratelimit-reset");
        
        return NextResponse.json(
          {
            error: "GitHub API rate limit exceeded",
            rateLimitRemaining: rateLimitRemaining ? parseInt(rateLimitRemaining, 10) : null,
            rateLimitReset: rateLimitReset ? parseInt(rateLimitReset, 10) : null,
          },
          { status: 429 }
        );
      }

      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorData.message || `GitHub API error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const stargazersCount = data.stargazers_count ?? 0;

    return NextResponse.json(
      { stargazersCount, repo: data.full_name },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching GitHub stars:", error);
    return NextResponse.json(
      { error: "Failed to fetch repository data" },
      { status: 500 }
    );
  }
}

