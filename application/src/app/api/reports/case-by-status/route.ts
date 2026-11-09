
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        status,
        COUNT(*) AS case_count
      FROM cases
      GROUP BY status
      ORDER BY case_count DESC
    `);

    return NextResponse.json({
      success: true,
      report: "Cases by Status",
      data: rows,
    });
  } catch (error) {
    console.error("Cases by status error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve cases by status.",
      },
      { status: 500 }
    );
  }
}
