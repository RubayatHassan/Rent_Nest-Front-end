import Image from "next/image";

type OptimizedImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  sizes: string;
  className?: string;
  width?: number;
  height?: number;
};

function normalizeImageSrc(src: string) {
  const value = src
    .trim()
    .replace(/^("|')(.*)\1$/, "$2")
    .trim();

  // Next Image accepts absolute URLs and root-relative public URLs. The API
  // may also return a relative upload path, so resolve that against the API
  // server instead of sending an invalid relative path to next/image.
  if (/^(https?:|data:|blob:)/i.test(value) || value.startsWith("/")) {
    return value;
  }

  try {
    const apiOrigin = new URL(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
    ).origin;
    return `${apiOrigin}/${value}`;
  } catch {
    return value;
  }
}

export function OptimizedImage({
  src,
  alt,
  priority = false,
  sizes,
  className,
  width,
  height,
}: OptimizedImageProps) {
  const imageSrc = normalizeImageSrc(src);

  if (width && height) {
    return (
      <Image
        src={imageSrc}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        priority={priority}
        quality={70}
        className={className}
        style={{ objectFit: "cover" }}
      />
    );
  }

  return (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      quality={70}
      className={className}
      style={{ objectFit: "cover" }}
    />
  );
}
