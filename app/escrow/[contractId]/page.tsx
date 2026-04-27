"use client";

import { useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useEscrowEvents, EscrowEvent } from "@/hooks/useEscrowEvents";

export default function EscrowPage() {
  const { contractId } = useParams<{ contractId: string }>();
  const [events, setEvents] = useState<EscrowEvent[]>([]);

  const handleEvent = useCallback((event: EscrowEvent) => {
    setEvents((prev) => [event, ...prev]);
  }, []);

  useEscrowEvents({ contractId, onEvent: handleEvent });

  return (
    <main className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-2xl font-bold text-white mb-2">Escrow Contract</h1>
      <p className="text-dark-400 text-sm font-mono break-all mb-8">{contractId}</p>

      <h2 className="text-lg font-semibold text-white mb-4">Live Event Log</h2>

      {events.length === 0 ? (
        <p className="text-dark-500 text-sm">Listening for transactions…</p>
      ) : (
        <ul className="space-y-3">
          {events.map((ev) => (
            <li key={ev.id} className="glass-card p-4 rounded-xl">
              <p className="text-xs text-dark-400 mb-1">
                {new Date(ev.createdAt).toLocaleString()}
              </p>
              <p className="text-white text-sm font-mono truncate">{ev.hash}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
