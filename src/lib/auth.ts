import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import crypto from "crypto";

// === CONSTANTS ===
const COOKIE_NAME = "hr4_session";
const SESSION_MAX_AGE = 60 * 60 * 8; // 8 jam
const SECRET = process.env.AUTH_SECRET || "dev-secret-change-in-production-32chars!!";

// === TYPES ===
export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: string | null;
};

type SessionPayload = SessionUser & {
  exp: number;
  iat: number;
};

// === SIGN & VERIFY ===
function sign(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "session" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(`${header}.${body}`)
    .digest("base64url");
  return `${header}.${body}.${signature}`;
}

function verify(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", SECRET)
      .update(`${header}.${body}`)
      .digest("base64url");

    // Constant-time comparison
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Date.now()) return null; // expired

    return payload;
  } catch {
    return null;
  }
}

// === CREATE & DESTROY SESSION ===
export async function createSession(user: SessionUser): Promise<string> {
  const now = Date.now();
  const payload: SessionPayload = {
    ...user,
    iat: now,
    exp: now + SESSION_MAX_AGE * 1000,
  };

  const token = sign(payload);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  return token;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

// === GET CURRENT USER ===
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verify(token);
}

// === API HELPER — protect API routes ===
export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// === PAGE HELPER — protect pages (redirect to login) ===
export async function requireAuth(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session as SessionPayload;
}

export async function getOptionalSession(): Promise<SessionPayload | null> {
  return getSession();
}
