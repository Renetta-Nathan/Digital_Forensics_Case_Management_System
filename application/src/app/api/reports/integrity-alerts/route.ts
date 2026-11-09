
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        e.evidence_code,
        c.case_number,
        e.integrity_status,
        e.sha256
      FROM evidence e
      JOIN cases c
        ON c.case_id = e.case_id
      WHERE e.integrity_status IN ('UNVERIFIED', 'MISMATCH')
      ORDER BY
        CASE e.integrity_status
          WHEN 'MISMATCH' THEN 1
          ELSE 2
        END
    `);

    return NextResponse.json({
      success: true,
      report: "Evidence Integrity Alerts",
      data: rows,
    });
  } catch (error) {
    console.error("Integrity alerts error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve evidence integrity alerts.",
      },
      { status: 500 }
    );
  }
}
