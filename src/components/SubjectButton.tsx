import { type ComponentProps } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubjectButtonProps extends ComponentProps<typeof Button> {
  active?: boolean;
}

export function SubjectButton({
  active = false,
  className,
  children,
  ...props
}: SubjectButtonProps) {
  return (
    <Button
      {...props}
      aria-pressed={active}
      variant="ghost"
      className={cn(
        "h-10 rounded-sm border px-4 text-[0.7rem] font-black uppercase tracking-[0.18em] shadow-none transition-none",
        "focus-visible:ring-2 focus-visible:ring-primary/40",
        active
          ? "border-primary bg-primary text-primary-foreground hover:bg-primary"
          : "border-border bg-card text-muted-foreground hover:border-primary/70 hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      {children}
    </Button>
  );
}
