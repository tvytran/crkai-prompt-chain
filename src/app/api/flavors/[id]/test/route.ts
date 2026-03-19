import { NextResponse } from "next/server";

const API_BASE = "https://api.almostcrackd.ai";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
  }

  try {
    // Use the imageId from the request body if provided, or upload the image first
    let imageId = body.imageId;

    if (!imageId && body.imageUrl) {
      // Register image from URL
      const registerRes = await fetch(`${API_BASE}/pipeline/upload-image-from-url`, {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: body.imageUrl, isCommonUse: false }),
      });

      if (!registerRes.ok) {
        const text = await registerRes.text();
        return NextResponse.json(
          { error: `Failed to register image: ${text}` },
          { status: registerRes.status }
        );
      }

      const registerData = await registerRes.json();
      imageId = registerData.imageId;
    }

    if (!imageId) {
      return NextResponse.json(
        { error: "Either imageId or imageUrl is required" },
        { status: 400 }
      );
    }

    // Generate captions using the humor flavor
    const generateRes = await fetch(`${API_BASE}/pipeline/generate-captions`, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageId,
        humorFlavorId: id,
      }),
    });

    if (!generateRes.ok) {
      const text = await generateRes.text();
      return NextResponse.json(
        { error: `Failed to generate captions: ${text}` },
        { status: generateRes.status }
      );
    }

    const captionData = await generateRes.json();
    return NextResponse.json({
      imageId,
      captions: Array.isArray(captionData) ? captionData : [captionData],
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 500 }
    );
  }
}
