import * as React from "react";
import { Modal } from "./modal";
import { cn } from "@/lib/utils";

interface ImagePreviewProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function ImagePreview({
  src,
  alt = "Image preview",
  isOpen,
  onClose,
  className
}: ImagePreviewProps) {
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [isOpen, src]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className={className}>
      <div className="flex items-center justify-center p-4 h-full min-h-[300px] sm:min-h-[400px] md:min-h-[500px]">
        {!imageLoaded && !imageError && (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          </div>
        )}

        {imageError && (
          <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">📷</div>
            <p>Failed to load image</p>
          </div>
        )}

        <img
          src={src}
          alt={alt}
          className={cn(
            "max-w-full max-h-full object-contain transition-opacity duration-200",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          style={{
            maxHeight: "calc(90vh - 8rem)", // Account for padding and close button
          }}
        />
      </div>
    </Modal>
  );
}

interface ImageWithPreviewProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  previewClassName?: string;
}

export function ImageWithPreview({
  src,
  alt,
  className,
  previewClassName,
  onClick,
  ...props
}: ImageWithPreviewProps) {
  const [previewOpen, setPreviewOpen] = React.useState(false);

  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setPreviewOpen(true);

    // Call the original onClick if provided
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <>
      <img
        {...props}
        src={src}
        alt={alt}
        className={cn("cursor-pointer transition-opacity hover:opacity-80", className)}
        onClick={handleImageClick}
      />

      <ImagePreview
        src={src}
        alt={alt}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        className={previewClassName}
      />
    </>
  );
}
