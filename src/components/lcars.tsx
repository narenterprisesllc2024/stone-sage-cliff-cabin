import type { ButtonHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import type { LcarsSwatch } from "@/lib/types";

export const SWATCH_BG: Record<LcarsSwatch, string> = {
  orange: "bg-lcars-orange",
  peach: "bg-lcars-peach",
  gold: "bg-lcars-gold",
  lilac: "bg-lcars-lilac",
  blue: "bg-lcars-blue",
  eggplant: "bg-lcars-eggplant text-lcars-peach",
};

type Tone = LcarsSwatch | "canary" | "navy" | "alert";

const TONE: Record<Tone, string> = {
  ...SWATCH_BG,
  canary: "bg-lcars-canary",
  navy: "bg-lcars-navy text-lcars-peach",
  alert: "bg-lcars-alert text-lcars-canary",
};

type Shape = "hand-right" | "hand-left" | "pill" | "block" | "foot";

const SHAPE: Record<Shape, string> = {
  "hand-right": "lcars-hand-right",
  "hand-left": "lcars-hand-left",
  pill: "lcars-pill",
  block: "rounded-none",
  foot: "rounded-none rounded-bl-lcars",
};

type LcarsButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: Tone;
  shape?: Shape;
  active?: boolean;
  tall?: "sm" | "md" | "lg" | "xl";
};

const TALL = {
  sm: "min-h-11 text-sm",
  md: "min-h-14 text-base",
  lg: "min-h-16 text-lg",
  xl: "min-h-20 text-xl",
};

export function LcarsButton({
  tone = "orange",
  shape = "hand-right",
  active,
  tall = "md",
  className,
  children,
  ...props
}: LcarsButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "lcars-btn w-full",
        TONE[tone],
        SHAPE[shape],
        TALL[tall],
        active && "ring-2 ring-lcars-canary ring-offset-2 ring-offset-void",
        className,
      )}
      {...props}
    >
      <span className="lcars-label">{children}</span>
    </button>
  );
}

export function LcarsBar({
  tone = "orange",
  shape = "hand-right",
  className,
  children,
}: {
  tone?: Tone;
  shape?: Shape;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-end justify-end px-3 py-1.5 text-void lcars-label",
        TONE[tone],
        SHAPE[shape],
        className,
      )}
    >
      {children}
    </div>
  );
}

export function LcarsField({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("grid gap-1", className)}>
      <span className="lcars-label text-sm text-lcars-orange">{label}</span>
      {children}
    </label>
  );
}

export function LcarsInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "lcars-input min-h-11 border-b-4 border-lcars-orange bg-void px-2 py-2 font-body text-base text-lcars-peach",
        className,
      )}
      {...props}
    />
  );
}

export function LcarsTextarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn("lcars-textarea h-full min-h-40 text-base md:text-lg", className)}
      {...props}
    />
  );
}

export function ModalScrim({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-void/80 p-3 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90dvh] w-full max-w-lg overflow-y-auto fade-rise"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
