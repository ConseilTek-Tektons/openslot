import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/auth";
import { database } from "@/lib/db";
import { hasEffectivePermission } from "@/lib/rbac-server";

export const runtime = "nodejs";

const workspaceId = process.env.WORKSPACE_ID ?? "00000000-0000-4000-8000-000000000001";
const bookingSchema = z.object({
  eventTypeId: z.string().uuid(),
  hostId: z.string().uuid(),
  inviteeName: z.string().trim().min(2).max(120),
  inviteeEmail: z.string().email(),
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
  timezone: z.string().min(1).max(80),
  qualification: z.record(z.string(), z.unknown()).default({}),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!await hasEffectivePermission(session.user.roles, "dashboard.view")) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  if (!process.env.DATABASE_URL && !process.env.PGHOST) return NextResponse.json({ data: [], mode: "demo-ui" });

  const sql = database();
  const rows = await sql`
    select id, invitee_name, invitee_email, starts_at, ends_at, timezone, status, host_id, event_type_id
    from booking
    where organisation_id = ${workspaceId}
    order by starts_at asc
    limit 100
  `;
  return NextResponse.json({ data: rows, mode: "postgres" });
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  if (!await hasEffectivePermission(session.user.roles, "bookings.manage")) return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  if (!process.env.DATABASE_URL && !process.env.PGHOST) return NextResponse.json({ error: "PostgreSQL is required for persistent bookings." }, { status: 503 });

  const parsed = bookingSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || new Date(parsed.data.endsAt) <= new Date(parsed.data.startsAt)) {
    return NextResponse.json({ error: "Invalid booking." }, { status: 400 });
  }

  const sql = database();
  try {
    const booking = await sql.begin(async (transaction) => {
      const [created] = await transaction`
        insert into booking (
          organisation_id, event_type_id, host_id, invitee_name, invitee_email,
          starts_at, ends_at, timezone, qualification_response
        ) values (
          ${workspaceId}, ${parsed.data.eventTypeId}, ${parsed.data.hostId},
          ${parsed.data.inviteeName}, ${parsed.data.inviteeEmail},
          ${parsed.data.startsAt}, ${parsed.data.endsAt}, ${parsed.data.timezone},
          ${transaction.json(JSON.parse(JSON.stringify(parsed.data.qualification)))}
        ) returning *
      `;
      await transaction`
        insert into audit_event (organisation_id, actor_id, action, entity_type, entity_id, payload)
        values (${workspaceId}, ${session.user.id}, 'booking.created', 'booking', ${created.id}, ${transaction.json({ startsAt: parsed.data.startsAt })})
      `;
      return created;
    });
    return NextResponse.json({ data: booking }, { status: 201 });
  } catch (error) {
    if (String(error).includes("booking_no_overlap")) {
      return NextResponse.json({ error: "That host is no longer available for this time." }, { status: 409 });
    }
    console.error("booking.create_failed", { message: String(error) });
    return NextResponse.json({ error: "Booking could not be created." }, { status: 500 });
  }
}
