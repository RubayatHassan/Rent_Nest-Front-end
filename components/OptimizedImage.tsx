import Image from "next/image";

type OptimizedImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
};

export function OptimizedImage({ src, alt, priority = false, sizes, className }: OptimizedImageProps) {
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} style={{ objectFit: "cover" }} />;
}
