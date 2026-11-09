
import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        c.case_number,
        c.title
      FROM cases c
      WHERE NOT EXISTS (
        SELECT 1
        FROM case_investigators ci
        WHERE ci.case_id = c.case_id
      )
    `);

    return NextResponse.json({
      success: true,
      report: "Unassigned Cases",
      data: rows,
    });
  } catch (error) {
    console.error("Unassigned cases error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to retrieve unassigned cases.",
      },
      { status: 500 }
    );
  }
}
