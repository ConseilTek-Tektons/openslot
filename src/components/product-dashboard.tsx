"use client";

import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  Globe2,
  Link2,
  MoreHorizontal,
  Plus,
  Route,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";

import { hasPermission } from "@/lib/rbac";

const trend = [
  { day: "Mon", bookings: 31 },
  { day: "Tue", bookings: 45 },
  { day: "Wed", bookings: 38 },
  { day: "Thu", bookings: 62 },
  { day: "Fri", bookings: 54 },
  { day: "Sat", bookings: 18 },
  { day: "Sun", bookings: 14 },
];

type Booking = {
  id: number;
  time: string;
  name: string;
  company: string;
  type: string;
  host: string;
  color: string;
};

const initialBookings: Booking[] = [
  { id: 1, time: "09:30", name: "Elena Marquez", company: "Arcway", type: "Enterprise discovery", host: "Priya Rao", color: "lime" },
  { id: 2, time: "11:00", name: "Sam Okafor", company: "Nimble Systems", type: "Technical deep dive", host: "Jon Bell", color: "violet" },
  { id: 3, time: "13:30", name: "Ari Feld", company: "Northwind", type: "Partner briefing", host: "Maya Chen", color: "cyan" },
  { id: 4, time: "15:00", name: "Nora Singh", company: "Sierra Labs", type: "Enterprise discovery", host: "Priya Rao", color: "lime" },
];

export function ProductDashboard({ roles }: { roles: string[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const canManage = hasPermission(roles, "bookings.manage");

  const bookedMinutes = useMemo(() => bookings.length * 30, [bookings.length]);

  function createBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "Guest");
    const company = String(data.get("company") ?? "Direct");
    const time = String(data.get("time") ?? "16:00");
    setBookings((current) => [
      ...current,
      {
        id: Date.now(),
        time,
        name,
        company,
        type: "Enterprise discovery",
        host: "Maya Chen",
        color: "lime",
      },
    ]);
    setBookingOpen(false);
    setNotice(`Booking confirmed for ${name} at ${time}.`);
  }

  async function copyLink() {
    await navigator.clipboard.writeText(`${window.location.origin}/book/enterprise-discovery`);
    setNotice("Secure booking link copied.");
  }

  return (
    <>
      <header className="page-heading">
        <div>
          <p className="mono-label">MONDAY · SEPTEMBER 7</p>
          <h1>Good morning, Maya.</h1>
          <p>Your team has 16 meetings today across three routing pools.</p>
        </div>
        <div className="heading-actions">
          <button className="secondary-button" onClick={() => void copyLink()}><Copy size={15} /> Copy booking link</button>
          {canManage && <button className="primary-button" onClick={() => setBookingOpen(true)}><Plus size={16} /> New booking</button>}
        </div>
      </header>

      {notice && <div className="notice" role="status"><CheckCircle2 size={16} /> {notice}<button onClick={() => setNotice("")}><X size={14} /></button></div>}

      <section className="metric-grid" aria-label="Booking performance">
        <article className="metric-card featured">
          <div className="metric-top"><span>Bookings this week</span><CalendarDays size={17} /></div>
          <strong>262</strong>
          <p><span className="positive">↗ 12.4%</span> from last week</p>
          <div className="mini-chart">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 5, right: 0, bottom: 0, left: 0 }}>
                <defs><linearGradient id="bookingFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#a3ff12" stopOpacity={0.4}/><stop offset="100%" stopColor="#a3ff12" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="day" hide />
                <Tooltip contentStyle={{ background: "#171717", border: "1px solid #333", borderRadius: 6 }} />
                <Area type="monotone" dataKey="bookings" stroke="#a3ff12" fill="url(#bookingFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="metric-card">
          <div className="metric-top"><span>Conversion rate</span><ArrowUpRight size={17} /></div>
          <strong>68.4%</strong>
          <p><span className="positive">↗ 4.1 pts</span> qualified → booked</p>
          <div className="progress-track"><span style={{ width: "68.4%" }} /></div>
        </article>
        <article className="metric-card">
          <div className="metric-top"><span>Median time to meet</span><Clock3 size={17} /></div>
          <strong>2.8 days</strong>
          <p><span className="positive">↓ 0.6 days</span> versus target</p>
          <div className="comparison"><span>Target</span><b>≤ 3.5 days</b></div>
        </article>
        <article className="metric-card">
          <div className="metric-top"><span>Routing health</span><Route size={17} /></div>
          <strong>96.7%</strong>
          <p><span className="warning">3 reviews</span> need an owner</p>
          <div className="status-row"><span /><span /><span /><span className="warn" /></div>
        </article>
      </section>

      <div className="dashboard-grid">
        <section className="surface schedule-surface">
          <header className="surface-header">
            <div><h2>Today’s schedule</h2><p>{bookings.length} meetings · {bookedMinutes / 60} hours booked</p></div>
            <div className="date-controls"><button aria-label="Previous day"><ChevronLeft size={16} /></button><span>Today</span><button aria-label="Next day"><ChevronRight size={16} /></button></div>
          </header>
          <div className="booking-list">
            {bookings.map((booking) => (
              <article className="booking-row" key={booking.id}>
                <time>{booking.time}</time>
                <span className={`event-rail ${booking.color}`} />
                <div className="booking-main"><strong>{booking.name}</strong><span>{booking.company} · {booking.type}</span></div>
                <div className="host-pill"><span>{booking.host.split(" ").map((part) => part[0]).join("")}</span>{booking.host}</div>
                <button className="icon-button" aria-label={`More actions for ${booking.name}`}><MoreHorizontal size={17} /></button>
              </article>
            ))}
          </div>
          <button className="surface-link" onClick={() => setBookingOpen(true)} disabled={!canManage}>Open scheduling workspace <ArrowUpRight size={14} /></button>
        </section>

        <div className="side-stack">
          <section className="surface">
            <header className="surface-header"><div><h2>Routing pools</h2><p>Trailing 30 days</p></div><Route size={18} /></header>
            <div className="pool-list">
              <div className="pool"><span className="pool-icon lime"><Globe2 size={15} /></span><div><strong>Enterprise Americas</strong><small>42% of qualified leads</small></div><b>98%</b></div>
              <div className="pool"><span className="pool-icon violet"><Users size={15} /></span><div><strong>Mid-market EMEA</strong><small>Fairness drift: +9 pts</small></div><b className="warning">Review</b></div>
              <div className="pool"><span className="pool-icon cyan"><Link2 size={15} /></span><div><strong>Partner network</strong><small>CRM owner override</small></div><b>Healthy</b></div>
            </div>
          </section>
          <section className="insight-card">
            <span className="insight-icon"><Sparkles size={18} /></span>
            <div><p className="mono-label">AI INSIGHT</p><h3>EMEA fairness is drifting.</h3><p>Two hosts were unavailable during the busiest window. Rebalancing weights to 40/35/25 restores the target within five bookings.</p><button>Review recommendation <ArrowUpRight size={14} /></button></div>
          </section>
        </div>
      </div>

      {bookingOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={() => setBookingOpen(false)}>
          <form className="modal" onSubmit={createBooking} onMouseDown={(event) => event.stopPropagation()}>
            <header><div><p className="mono-label">NEW BOOKING</p><h2>Enterprise discovery</h2></div><button type="button" onClick={() => setBookingOpen(false)} aria-label="Close"><X size={18} /></button></header>
            <label>Guest name<input name="name" required placeholder="Avery Morgan" /></label>
            <label>Company<input name="company" required placeholder="Acme, Inc." /></label>
            <label>Available time<select name="time" defaultValue="16:00"><option>16:00</option><option>16:30</option><option>17:00</option></select></label>
            <div className="route-preview"><Route size={16} /><span><strong>Routing preview</strong>Assigned to Maya Chen based on enterprise territory and availability.</span></div>
            <footer><button type="button" className="secondary-button" onClick={() => setBookingOpen(false)}>Cancel</button><button className="primary-button" type="submit">Confirm booking</button></footer>
          </form>
        </div>
      )}
    </>
  );
}
