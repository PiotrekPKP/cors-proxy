export async function POST(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const targetUrl = searchParams.get("url");
  const providedKey = searchParams.get("key");

  const apiKey = process.env.API_KEY;

  if (!providedKey || providedKey !== apiKey) {
    return new Response("Unauthorized: Invalid API key", {
      status: 401,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (!targetUrl) {
    return new Response("Missing 'url' parameter", { status: 400 });
  }

  const contentType = request.headers.get("content-type") || "";
  let body: BodyInit | null = null;

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await request.formData();
    const params = new URLSearchParams();
    for (const [key, value] of formData.entries()) {
      if (typeof value === "string") {
        params.append(key, value);
      }
    }
    body = params;
  } else if (contentType.includes("multipart/form-data")) {
    body = await request.formData();
  } else {
    return new Response("Unsupported content-type", { status: 415 });
  }

  const proxyResponse = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": contentType,
    },
    body,
  });

  const proxyBody = await proxyResponse.text();

  return new Response(proxyBody, {
    status: proxyResponse.status,
    headers: {
      "Content-Type": proxyResponse.headers.get("Content-Type") || "text/plain",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const targetUrl = searchParams.get("url");
  const providedKey = searchParams.get("key");

  const apiKey = process.env.API_KEY;

  if (!providedKey || providedKey !== apiKey) {
    return new Response("Unauthorized: Invalid API key", {
      status: 401,
      headers: {
        "Content-Type": "text/plain",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  if (!targetUrl) {
    return new Response("Missing 'url' parameter", {
      status: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // Forward the GET request to the targetUrl
  const proxyResponse = await fetch(targetUrl, {
    method: "GET",
    // No body, headers could be forwarded if you want, but fuck it for now
  });

  const responseHeaders = new Headers(proxyResponse.headers);
  responseHeaders.set("Access-Control-Allow-Origin", "*");

  return new Response(proxyResponse.body, {
    status: proxyResponse.status,
    headers: responseHeaders,
  });
}

export const runtime = "edge";
