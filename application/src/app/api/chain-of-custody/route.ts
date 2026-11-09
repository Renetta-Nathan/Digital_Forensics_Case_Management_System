import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        cc.custody_id,
        cc.evidence_id,
        e.evidence_code,
        c.case_number,
        e.description AS evidence_description,
        cc.from_handler,
        cc.to_handler,
        cc.action,
        cc.event_time,
        cc.seal_number,
        cc.remarks,
        cc.recorded_by,
        u.full_name AS recorded_by_name
      FROM chain_of_custody cc
      LEFT JOIN evidence e
        ON cc.evidence_id = e.evidence_id
      LEFT JOIN cases c
        ON e.case_id = c.case_id
      LEFT JOIN investigators i
        ON cc.recorded_by = i.investigator_id
      LEFT JOIN users u
        ON i.user_id = u.user_id
      ORDER BY cc.event_time DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error("Chain of Custody API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve chain of custody records"
      },
      { status: 500 }
    );
  }
}