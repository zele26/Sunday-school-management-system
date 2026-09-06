'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { cn } from './utils';

/**
 * Enhanced Next.js Image component wrapper supporting static imports,
 * relative paths, remote URLs, and fallback states.
 */
export const AppImage = React.forwardRef(
  (
    {
      src,
      alt = 'Church System Image',
      width,
      height,
      fill = false,
      priority = false,
      className,
      fallbackSrc,
      unoptimized,
      ...props
    },
    ref
  ) => {
    const [imgError, setImgError] = useState(false);

    // Resolve image source
    let resolvedSrc = src;
    if (!resolvedSrc) {
      resolvedSrc = fallbackSrc || '/assets/ChurchLogo.png';
    }

    if (imgError && fallbackSrc) {
      resolvedSrc = fallbackSrc;
    }

    // Determine whether to unoptimize (e.g. data URLs, blob URLs, SVGs, or external if not configured)
    const isDataOrBlob =
      typeof resolvedSrc === 'string' &&
      (resolvedSrc.startsWith('data:') || resolvedSrc.startsWith('blob:'));
    const shouldUnoptimize = unoptimized ?? (isDataOrBlob || false);

    // If fill is requested, width and height must not be passed
    if (fill) {
      return (
        <Image
          ref={ref}
          src={resolvedSrc}
          alt={alt}
          fill
          priority={priority}
          unoptimized={shouldUnoptimize}
          onError={() => setImgError(true)}
          className={cn('object-cover', className)}
          {...props}
        />
      );
    }

    // If static imported image (Next.js StaticImageData has width/height already)
    const isStaticObject = typeof resolvedSrc === 'object' && resolvedSrc?.src;
    const finalWidth = width || (isStaticObject ? resolvedSrc.width : 200);
    const finalHeight = height || (isStaticObject ? resolvedSrc.height : 200);

    return (
      <Image
        ref={ref}
        src={resolvedSrc}
        alt={alt}
        width={finalWidth}
        height={finalHeight}
        priority={priority}
        unoptimized={shouldUnoptimize}
        onError={() => setImgError(true)}
        className={className}
        style={{ width: 'auto', height: 'auto', ...props.style }}
        {...props}
      />
    );
  }
);

AppImage.displayName = 'AppImage';

export default AppImage;
