import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        f.finding_id,
        f.case_id,
        c.case_number,
        c.title AS case_title,
        f.evidence_id,
        e.evidence_code,
        f.investigator_id,
        u.full_name AS investigator_name,
        f.finding_title,
        f.finding_text,
        f.confidence,
        f.found_at
      FROM findings f
      LEFT JOIN cases c
        ON f.case_id = c.case_id
      LEFT JOIN evidence e
        ON f.evidence_id = e.evidence_id
      LEFT JOIN investigators i
        ON f.investigator_id = i.investigator_id
      LEFT JOIN users u
        ON i.user_id = u.user_id
      ORDER BY f.found_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error("Findings API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve findings"
      },
      { status: 500 }
    );
  }
}