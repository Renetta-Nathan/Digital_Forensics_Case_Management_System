
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.case_number,
        c.title,
        COUNT(e.evidence_id) AS evidence_count
      FROM cases c
      JOIN evidence e
        ON e.case_id = c.case_id
      GROUP BY
        c.case_id,
        c.case_number,
        c.title
      HAVING COUNT(e.evidence_id) >= 2
    `);

    return NextResponse.json({
      success: true,
      report: "Cases with Multiple Evidence",
      data: rows,
    });
  } catch (error) {
    console.error("Multiple evidence report error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve multiple evidence report.",
      },
      { status: 500 }
    );
  }
}
