import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Image = forwardRef(
  (
    {
      src,
      alt,
      className,
      onLoad,
      onError,
      loading = "lazy",
      ...props
    },
    ref
  ) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = (e) => {
      setIsLoading(false);
      onLoad?.(e);
    };

    const handleError = (e) => {
      setIsLoading(false);
      setHasError(true);
      onError?.(e);
    };

    if (hasError) {
      return (
        <div
          className={cn(
            "flex items-center justify-center bg-muted text-muted-foreground",
            className
          )}
          ref={ref}
          {...props}
        >
          <span className="text-sm">Failed to load image</span>
        </div>
      );
    }

    return (
      <img
        ref={ref}
        src={src}
        alt={alt}
        className={cn(
          isLoading && "opacity-0",
          "transition-opacity duration-200",
          className
        )}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    );
  }
);

Image.displayName = "Image";

