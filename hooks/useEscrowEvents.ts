"use client";

import { useEffect, useRef } from "react";

const HORIZON_URL = "https://horizon-testnet.stellar.org";

export interface EscrowEvent {
  id: string;
  hash: string;
  createdAt: string;
}

interface UseEscrowEventsOptions {
  contractId: string | null;
  onEvent: (event: EscrowEvent) => void;
}

export function useEscrowEvents({ contractId, onEvent }: UseEscrowEventsOptions) {
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  useEffect(() => {
    if (!contractId) return;

    const url = `${HORIZON_URL}/accounts/${contractId}/transactions?cursor=now&order=asc`;
    const es = new EventSource(url);

    es.onmessage = (e) => {
      try {
        const raw = JSON.parse(e.data) as Record<string, unknown>;
        onEventRef.current({
          id: raw.id as string,
          hash: raw.hash as string,
          createdAt: raw.created_at as string,
        });
      } catch {
        // ignore malformed frames
      }
    };

    return () => es.close();
  }, [contractId]);
}
