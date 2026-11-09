
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;

    const database = client.db("digital_forensics_mongo");

    const artifacts = await database
      .collection("forensic_artifacts")
      .find({})
      .sort({ collectedAt: -1 })
      .toArray();

    const formattedArtifacts = artifacts.map((artifact) => ({
      ...artifact,
      _id: artifact._id.toString(),
    }));

    return NextResponse.json({
      success: true,
      total: formattedArtifacts.length,
      data: formattedArtifacts,
    });
  } catch (error) {
    console.error("MongoDB artifacts API error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve forensic artifacts",
      },
      { status: 500 }
    );
  }
}
