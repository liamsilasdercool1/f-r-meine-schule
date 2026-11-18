import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const V = {
  primary: "bg-primary text-primary-foreground shadow-[0_4px_0_var(--primary-deep)] hover:brightness-105",
  secondary: "bg-secondary text-secondary-foreground shadow-[0_4px_0_var(--secondary-deep)] hover:brightness-105",
  danger: "bg-destructive text-destructive-foreground shadow-[0_4px_0_var(--destructive-deep)]",
  gold: "bg-gold text-foreground shadow-[0_4px_0_var(--gold-deep)]",
  ghost: "bg-card text-foreground border-2 border-border shadow-[0_4px_0_var(--border)] hover:bg-muted",
};
export function Btn({ variant = "primary", className, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof V }) {
  return <button {...p} className={cn("btn-3d px-5 py-3 text-sm", V[variant], className)} />;
}
export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) {
  return <div {...p} className={cn("rounded-2xl border-2 border-border bg-card p-5", className)} />;
}
export function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-4 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${Math.max(0, Math.min(100, value))}%` }}>
        <div className="mx-2 mt-1 h-1 rounded-full bg-primary-foreground/30" />
      </div>
    </div>
  );
}
