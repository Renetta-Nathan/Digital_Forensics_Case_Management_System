
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT *
      FROM v_case_evidence_summary
      ORDER BY evidence_count DESC
    `);

    return NextResponse.json({
      success: true,
      report: "Evidence Summary by Case",
      data: rows,
    });
  } catch (error) {
    console.error("Evidence summary error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve evidence summary.",
      },
      { status: 500 }
    );
  }
}
