import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

const logAuthRequest = (req: Request, method: string) => {
  const url = new URL(req.url);
  const isCallback = url.pathname.includes("/api/auth/callback");
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");
  // #region agent log
  fetch("http://127.0.0.1:7243/ingest/7ac8ebda-4169-4bad-ad58-b0f7064cbbd2", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "debug-session",
      runId: "pre-fix",
      hypothesisId: "H6",
      location: "src/app/api/auth/[...nextauth]/route.ts",
      message: "auth route request",
      data: {
        method,
        pathname: url.pathname,
        host: req.headers.get("host"),
        origin: req.headers.get("origin"),
        forwardedHost: req.headers.get("x-forwarded-host"),
        forwardedProto: req.headers.get("x-forwarded-proto"),
        isCallback,
        hasCode: Boolean(code),
        codeLength: code?.length ?? 0,
        hasState: Boolean(state),
        stateLength: state?.length ?? 0,
        hasErrorParam: Boolean(error),
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion agent log
};

const GET = async (req: Request) => {
  logAuthRequest(req, "GET");
  return handler(req);
};

const POST = async (req: Request) => {
  logAuthRequest(req, "POST");
  return handler(req);
};

export { GET, POST };
