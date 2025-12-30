import { cn } from "@/lib/utils";

export const PageContainer = ({ children, className }) => {
  return (
    <div className={cn("w-full px-4 sm:px-6 lg:px-8 py-4", className)}>
      {children}
    </div>
  );
};
