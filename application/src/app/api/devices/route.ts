import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await pool.query(`
      SELECT
        d.device_id,
        d.device_tag,
        d.device_type,
        d.manufacturer,
        d.model,
        d.serial_number,
        d.collected_at,
        d.notes,
        COUNT(DISTINCT ed.evidence_id) AS evidence_count
      FROM devices d
      LEFT JOIN evidence_devices ed
        ON d.device_id = ed.device_id
      GROUP BY
        d.device_id,
        d.device_tag,
        d.device_type,
        d.manufacturer,
        d.model,
        d.serial_number,
        d.collected_at,
        d.notes
      ORDER BY d.device_id DESC
    `);

    return NextResponse.json({
      success: true,
      data: rows
    });

  } catch (error) {
    console.error("Devices API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve devices"
      },
      { status: 500 }
    );
  }
}