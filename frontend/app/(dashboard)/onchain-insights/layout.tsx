import React from 'react';

export default function OnchainInsightsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {/* Simulation / Demo Dataset Notification Banner */}
      <div
        role="status"
        aria-label="Simulation Mode Alert"
        className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-300 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
          </span>
          <span className="font-semibold tracking-wider uppercase text-amber-300">
            Simulation Mode Active
          </span>
          <span className="hidden sm:inline text-amber-200/80">
            — On-Chain telemetry, disruption oracle feeds, and supplier multi-tier metrics are currently simulated demonstration datasets.
          </span>
        </div>
        <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-mono font-medium text-amber-200 border border-amber-500/30">
          DEMO DATASET
        </span>
      </div>
      {children}
    </div>
  );
}
