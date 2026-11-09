
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    // 1. Get total number of cases
    const [caseRows] = await pool.query(`
      SELECT COUNT(*) AS totalCases
      FROM cases
    `);

    // 2. Get total evidence and integrity statistics
    const [evidenceRows] = await pool.query(`
      SELECT
        COUNT(*) AS totalEvidence,
        SUM(integrity_status = 'VERIFIED') AS verified,
        SUM(integrity_status = 'MISMATCH') AS mismatch,
        SUM(integrity_status = 'UNVERIFIED') AS unverified
      FROM evidence
    `);

    // 3. Get total investigators
    const [investigatorRows] = await pool.query(`
      SELECT COUNT(*) AS totalInvestigators
      FROM investigators
    `);

    // 4. Get the four most recent cases and their evidence counts
    const [recentCases] = await pool.query(`
      SELECT
        c.case_id,
        c.case_number,
        c.title,
        c.status,
        c.priority,
        COUNT(e.evidence_id) AS evidence_count
      FROM cases c
      LEFT JOIN evidence e ON c.case_id = e.case_id
      GROUP BY
        c.case_id,
        c.case_number,
        c.title,
        c.status,
        c.priority,
        c.created_at
      ORDER BY c.created_at DESC
      LIMIT 4
    `);

    return NextResponse.json({
      success: true,
      data: {
        cases: (caseRows as any[])[0],
        evidence: (evidenceRows as any[])[0],
        investigators: (investigatorRows as any[])[0],
        recentCases,
      },
    });
  } catch (error) {
    console.error("Dashboard API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve dashboard data",
      },
      { status: 500 }
    );
  }
}
