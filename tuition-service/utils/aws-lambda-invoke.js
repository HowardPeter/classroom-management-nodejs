import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

export class LambdaInvoker {
  constructor() {
    this.client = new LambdaClient({ region: process.env.AWS_REGION || "ap-southeast-1" });
  }

  async invoke(method, route, token, functionName, body = null) {
    if (!method || typeof method !== "string") {
      throw new Error("Method must be a non-empty string");
    }

    const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
    if (!validMethods.includes(method.toUpperCase())) {
      throw new Error(`Invalid HTTP method: ${method}. Allowed: ${validMethods.join(", ")}`);
    }

    if (!route || typeof route !== "string" || !route.startsWith("/")) {
      throw new Error(`Route must be a string starting with "/". Received: ${route}`);
    }

    if (!token || typeof token !== "string") {
      throw new Error("Bearer token must be a non-empty string");
    }

    if (!functionName || typeof functionName !== "string") {
      throw new Error("FunctionName must be a non-empty string");
    }

    let encodedBody = null;
    if (body !== null) {
      if (typeof body === "object") {
        encodedBody = JSON.stringify(body);
      } else if (typeof body === "string") {
        encodedBody = body;
      } else {
        throw new Error("Body must be string or object");
      }
    }

    const payload = {
      version: "2.0",

      routeKey: `${method} ${route}`,
      rawPath: route,
      requestContext: {
        http: {
          method: method,
          path: route
        }
      },

      headers: {
        "authorization": `Bearer ${token}`,
        "content-type": "application/json"
      },

      body: encodedBody,
      isBase64Encoded: false
    };

    const command = new InvokeCommand({
      FunctionName: functionName,
      Payload: Buffer.from(JSON.stringify(payload)),
      InvocationType: "RequestResponse"
    });

    const res = await this.client.send(command);

    if (res.FunctionError) {
      throw new Error(`Lambda runtime error: ${res.FunctionError}`);
    }

    const jsonString = Buffer.from(res.Payload).toString("utf8");
    const data = JSON.parse(jsonString);

    if (data.statusCode >= 400) {
      throw new Error(`Lambda error ${data.statusCode}: ${data.body}`);
    }

    return data.body ? JSON.parse(data.body) : null;
  }
}