import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "bg-sky-100 text-sky-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-orange-100 text-orange-800",
        destructive: "bg-red-100 text-red-800",
        secondary: "bg-gray-100 text-gray-700",
        outline: "border border-gray-300 text-gray-700",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
