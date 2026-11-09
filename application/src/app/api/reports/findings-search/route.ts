
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("q")?.trim() || "transfer";

    if (searchTerm.length > 100) {
      return NextResponse.json(
        { success: false, message: "Search term is too long." },
        { status: 400 }
      );
    }

    const [rows] = await pool.query(
      `
        SELECT
          finding_id,
          finding_title,
          MATCH(finding_title, finding_text)
          AGAINST (? IN NATURAL LANGUAGE MODE) AS relevance
        FROM findings
        WHERE MATCH(finding_title, finding_text)
        AGAINST (? IN NATURAL LANGUAGE MODE)
        ORDER BY relevance DESC
      `,
      [searchTerm, searchTerm]
    );

    return NextResponse.json({
      success: true,
      report: "Full-Text Findings Search",
      searchTerm,
      data: rows,
    });
  } catch (error) {
    console.error("Findings search error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to search forensic findings.",
      },
      { status: 500 }
    );
  }
}
