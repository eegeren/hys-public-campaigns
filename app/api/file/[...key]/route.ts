import { GetObjectCommand } from "@aws-sdk/client-s3";
import { BUCKET, r2 } from "@/lib/r2";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ key: string[] }>;
  }
) {
  try {
    const { key } = await context.params;

    const objectKey = key.map(decodeURIComponent).join("/");

    const result = await r2.send(
      new GetObjectCommand({
        Bucket: BUCKET,
        Key: objectKey,
      })
    );

    if (!result.Body) {
      return new Response("Dosya bulunamadı", {
        status: 404,
      });
    }

    const bytes = await result.Body.transformToByteArray();

    return new Response(bytes, {
      headers: {
        "Content-Type":
          result.ContentType || "application/octet-stream",

        "Content-Length":
          result.ContentLength?.toString() ||
          bytes.length.toString(),

        "Cache-Control":
          "public, max-age=300, s-maxage=300",

        "Content-Disposition": "inline",
      },
    });
  } catch (error) {
    console.error("R2 file error:", error);

    return new Response("Dosya yüklenemedi", {
      status: 500,
    });
  }
}
