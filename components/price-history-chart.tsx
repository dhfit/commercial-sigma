"use client";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

type PricePoint = { price: number; date: Date; priceType: string };

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

export function PriceHistoryChart({ history }: { history: PricePoint[] }) {
  if (history.length < 2) return null;

  const data = history.map((h) => ({
    date: new Date(h.date).toLocaleDateString("en-CA", { month: "short", year: "2-digit" }),
    price: h.price,
    type: h.priceType,
  }));

  const soldEntry = data.find((d) => d.type === "SOLD");

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={fmt} tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} width={60} />
          <Tooltip
            formatter={(v) => [fmt(Number(v)), "Price"]}
            contentStyle={{ background: "#1e293b", border: "none", borderRadius: 8, fontSize: 12, color: "#f8fafc" }}
          />
          {soldEntry && <ReferenceLine x={soldEntry.date} stroke="#16a34a" strokeDasharray="4 2" label={{ value: "Sold", fill: "#16a34a", fontSize: 10 }} />}
          <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={2} dot={{ fill: "#2563eb", r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
