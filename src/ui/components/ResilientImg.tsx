import * as React from "react";

/**
 * Tries `primarySrc` first; on error switches to `fallbackSrc` (e.g. local file → placeholder photo).
 */
export function ResilientImg(props: {
  primarySrc: string;
  fallbackSrc: string;
  alt: string;
  className?: string;
}) {
  const [src, setSrc] = React.useState(props.primarySrc);
  React.useEffect(() => {
    setSrc(props.primarySrc);
  }, [props.primarySrc]);

  return (
    <img
      src={src}
      alt={props.alt}
      className={props.className}
      onError={() => setSrc(props.fallbackSrc)}
    />
  );
}
