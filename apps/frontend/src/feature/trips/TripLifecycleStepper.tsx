"use client";

import { Check } from "lucide-react";
import type { TripStatus } from "@/src/lib/type";

const STAGES: { key: TripStatus; label: string }[] = [
  { key: "DRAFT", label: "Draft" },
  { key: "DISPATCHED", label: "Dispatched" },
  { key: "COMPLETED", label: "Completed" },
  { key: "CANCELLED", label: "Cancelled" },
];

const LINEAR_ORDER: TripStatus[] = ["DRAFT", "DISPATCHED", "COMPLETED"];

export function TripLifecycleStepper({ status }: { status: TripStatus }) {
  const isCancelled = status === "CANCELLED";
  const currentIndex = LINEAR_ORDER.indexOf(isCancelled ? "DRAFT" : status);

  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Trip Lifecycle
      </p>
      <div className="flex items-center">
        {STAGES.map((stage, i) => {
          const isCancelledStage = stage.key === "CANCELLED";
          const stageIndex = LINEAR_ORDER.indexOf(stage.key);
          const done =
            !isCancelled && !isCancelledStage && stageIndex < currentIndex;
          const active = isCancelledStage
            ? isCancelled
            : !isCancelled && stageIndex === currentIndex;
          const last = i === STAGES.length - 1;

          return (
            <div
              key={stage.key}
              className="flex flex-1 items-center last:flex-none"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                    done
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : active
                        ? isCancelledStage
                          ? "border-rose-600 bg-rose-600 text-white"
                          : "border-indigo-600 bg-indigo-600 text-white"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  {done ? (
                    <Check className="h-4 w-4" />
                  ) : active ? (
                    <span className="h-2 w-2 rounded-full bg-white" />
                  ) : null}
                </div>
                <span
                  className={`mt-2 text-xs font-medium ${
                    active
                      ? isCancelledStage
                        ? "text-rose-600"
                        : "text-indigo-600"
                      : done
                        ? "text-slate-700"
                        : "text-slate-400"
                  }`}
                >
                  {stage.label}
                </span>
              </div>
              {!last && (
                <div
                  className={`mx-2 h-px flex-1 ${done ? "bg-emerald-300" : "bg-slate-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
