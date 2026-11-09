
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.case_id,
        c.case_number,
        c.title,
        c.description,
        c.priority,
        c.status,
        c.opened_date,
        c.closed_date,
        u.full_name AS created_by_name,
        COUNT(DISTINCT e.evidence_id) AS evidence_count,
        COUNT(DISTINCT ci.investigator_id) AS investigator_count
      FROM cases c
      LEFT JOIN users u ON c.created_by = u.user_id
      LEFT JOIN evidence e ON c.case_id = e.case_id
      LEFT JOIN case_investigators ci ON c.case_id = ci.case_id
      GROUP BY
        c.case_id,
        c.case_number,
        c.title,
        c.description,
        c.priority,
        c.status,
        c.opened_date,
        c.closed_date,
        u.full_name
      ORDER BY c.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Cases API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve cases",
      },
      { status: 500 }
    );
  }
}
