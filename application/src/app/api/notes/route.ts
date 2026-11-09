import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        n.note_id,
        n.case_id,
        c.case_number,
        c.title AS case_title,
        n.investigator_id,
        u.full_name AS investigator_name,
        n.note_text,
        n.created_at
      FROM notes n
      LEFT JOIN cases c
        ON n.case_id = c.case_id
      LEFT JOIN investigators i
        ON n.investigator_id = i.investigator_id
      LEFT JOIN users u
        ON i.user_id = u.user_id
      ORDER BY n.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error("Notes API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve notes"
      },
      { status: 500 }
    );
  }
}