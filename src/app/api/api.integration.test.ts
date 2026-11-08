import { afterAll, describe, expect, it } from "vitest";
import { pool } from "@/db";
import { GET as getHealth } from "@/app/api/health/route";
import { DELETE, GET, PATCH } from "@/app/api/projects/[id]/route";
import { POST as createProject } from "@/app/api/projects/route";

const createdProjectIds: number[] = [];

function routeContext(id: number) {
  return { params: Promise.resolve({ id: String(id) }) };
}

describe("API integration with PostgreSQL", () => {
  it("reports database connectivity through the health route", async () => {
    const response = await getHealth();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
  });

  it("creates, reads, updates, and deletes a project through route handlers", async () => {
    const title = `Integration test ${crypto.randomUUID()}`;
    const createResponse = await createProject(new Request("http://localhost/api/projects", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title, genre: "Test" }),
    }));
    expect(createResponse.status).toBe(201);
    const created = await createResponse.json();
    createdProjectIds.push(created.id);
    expect(created.title).toBe(title);

    const context = routeContext(created.id);
    const readResponse = await GET(new Request(`http://localhost/api/projects/${created.id}`), context);
    expect(readResponse.status).toBe(200);
    expect((await readResponse.json()).chapters).toHaveLength(1);

    const updateResponse = await PATCH(new Request(`http://localhost/api/projects/${created.id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: `${title} updated` }),
    }), context);
    expect(updateResponse.status).toBe(200);
    expect((await updateResponse.json()).title).toBe(`${title} updated`);

    const deleteResponse = await DELETE(new Request(`http://localhost/api/projects/${created.id}`, {
      method: "DELETE",
    }), context);
    expect(deleteResponse.status).toBe(200);
    createdProjectIds.splice(createdProjectIds.indexOf(created.id), 1);

    const missingResponse = await GET(new Request(`http://localhost/api/projects/${created.id}`), context);
    expect(missingResponse.status).toBe(404);
  });

  afterAll(async () => {
    for (const id of createdProjectIds) {
      await DELETE(new Request(`http://localhost/api/projects/${id}`, { method: "DELETE" }), routeContext(id));
    }
    await pool.end();
  });
});
