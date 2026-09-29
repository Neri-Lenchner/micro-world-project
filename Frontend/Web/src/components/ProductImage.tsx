import { useState } from "react";

interface Props {
  src: string | null;
  alt: string;
  className?: string;
}

// Shows the product photo, or a grey "No image" box if there is none or it fails to load.
export default function ProductImage({ src, alt, className = "" }: Props) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return <div className={`product-image placeholder ${className}`}>No image</div>;
  }
  return <img className={`product-image ${className}`} src={src} alt={alt} onError={() => setFailed(true)} />;
}
