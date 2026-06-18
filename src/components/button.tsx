import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

type ButtonProps = ComponentProps<"button"> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 border px-4 py-2 text-sm font-black uppercase tracking-wide transition active:translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "border-black bg-black text-white hover:bg-zinc-800",
        variant === "secondary" && "border-black bg-[var(--accent)] text-black hover:bg-lime-200",
        variant === "ghost" && "border-transparent bg-transparent text-black hover:bg-black/5",
        variant === "danger" && "border-red-700 bg-red-600 text-white hover:bg-red-700",
        className,
      )}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant = "primary",
  children,
  ...props
}: ComponentProps<typeof Link> & { variant?: ButtonProps["variant"]; children: ReactNode }) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 border px-4 py-2 text-sm font-black uppercase tracking-wide transition active:translate-y-0.5",
        variant === "primary" && "border-black bg-black text-white hover:bg-zinc-800",
        variant === "secondary" && "border-black bg-[var(--accent)] text-black hover:bg-lime-200",
        variant === "ghost" && "border-transparent bg-transparent text-black hover:bg-black/5",
        variant === "danger" && "border-red-700 bg-red-600 text-white hover:bg-red-700",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
