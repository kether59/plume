import { NextResponse } from "next/server";
import {
  authConfigurationError,
  createSessionToken,
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
  verifyEmail,
  verifyPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  const configurationError = authConfigurationError();
  if (configurationError) {
    return NextResponse.json({ error: configurationError }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    !("email" in body) ||
    typeof body.email !== "string" ||
    !("password" in body) ||
    typeof body.password !== "string"
  ) {
    return NextResponse.json({ error: "Saisissez votre adresse e-mail et votre mot de passe." }, { status: 400 });
  }

  if (!verifyEmail(body.email) || !verifyPassword(body.password)) {
    return NextResponse.json({ error: "Adresse e-mail ou mot de passe incorrect." }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return response;
}
