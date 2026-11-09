
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        i.investigator_id,
        u.full_name,
        COUNT(DISTINCT ci.case_id) AS assigned_cases,
        COUNT(DISTINCT e.evidence_id) AS collected_evidence
      FROM investigators i
      JOIN users u
        ON u.user_id = i.user_id
      LEFT JOIN case_investigators ci
        ON ci.investigator_id = i.investigator_id
      LEFT JOIN evidence e
        ON e.collected_by = i.investigator_id
      GROUP BY
        i.investigator_id,
        u.full_name
      ORDER BY assigned_cases DESC
    `);

    return NextResponse.json({
      success: true,
      report: "Investigator Workload",
      data: rows,
    });
  } catch (error) {
    console.error("Investigator workload error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve investigator workload.",
      },
      { status: 500 }
    );
  }
}
