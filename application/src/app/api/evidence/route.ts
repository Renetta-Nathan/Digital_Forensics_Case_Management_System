
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        e.evidence_id,
        e.evidence_code,
        e.case_id,
        c.case_number,
        c.title AS case_title,
        e.evidence_type,
        e.description,
        e.sha256,
        e.acquisition_method,
        e.storage_uri,
        e.collected_at,
        e.integrity_status,
        i.investigator_id,
        u.full_name AS collected_by_name
      FROM evidence e
      LEFT JOIN cases c
        ON e.case_id = c.case_id
      LEFT JOIN investigators i
        ON e.collected_by = i.investigator_id
      LEFT JOIN users u
        ON i.user_id = u.user_id
      ORDER BY e.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Evidence API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve evidence records",
      },
      { status: 500 }
    );
  }
}
