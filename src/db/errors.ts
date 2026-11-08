type DatabaseFailure = {
  status: number;
  message: string;
};

function errorDetails(error: unknown): { code?: string; message: string } {
  let current: unknown = error;
  const seen = new Set<unknown>();

  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const item = current as { code?: unknown; message?: unknown; cause?: unknown };
    if (typeof item.code === "string") {
      return {
        code: item.code,
        message: typeof item.message === "string" ? item.message : "",
      };
    }
    if (typeof item.message === "string" && !item.cause) {
      return { message: item.message };
    }
    current = item.cause;
  }

  return { message: error instanceof Error ? error.message : "" };
}

export function databaseFailure(error: unknown): DatabaseFailure | null {
  const { code, message } = errorDetails(error);

  if (
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT" ||
    code === "ENOTFOUND" ||
    code === "08001" ||
    code === "08006" ||
    /ECONNREFUSED|connection terminated unexpectedly/i.test(message)
  ) {
    return {
      status: 503,
      message:
        "PostgreSQL ne répond pas. Démarrez la base avec « docker compose up -d database », puis vérifiez DATABASE_URL dans .env.",
    };
  }

  if (code === "3D000") {
    return {
      status: 503,
      message:
        "La base de données indiquée par DATABASE_URL n’existe pas. Vérifiez .env et la configuration PostgreSQL.",
    };
  }

  if (code === "42P01") {
    return {
      status: 503,
      message:
        "Les tables de l’application ne sont pas créées. Après le démarrage de PostgreSQL, exécutez « npm run db:push ».",
    };
  }

  return null;
}
