import { useState } from 'react';

import { cn, getInitials } from '@/lib/utils';

export interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_STYLES: Record<NonNullable<AvatarProps['size']>, string> = {
  xs: 'size-5 text-2xs',
  sm: 'size-6 text-2xs',
  md: 'size-8 text-xs',
  lg: 'size-10 text-sm',
};

/**
 * User avatar with an initials fallback.
 *
 * Neutral by design: coloured, hash-generated avatars add visual noise to a
 * dense console without conveying information.
 */
export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const [hasImageFailed, setHasImageFailed] = useState(false);
  const showImage = Boolean(src) && !hasImageFailed;

  return (
    <span
      className={cn(
        'inline-grid shrink-0 place-items-center overflow-hidden rounded-full',
        'border border-border bg-surface-sunken font-semibold text-fg-muted select-none',
        SIZE_STYLES[size],
        className,
      )}
      // The name is announced by surrounding content; the avatar is decorative.
      aria-hidden="true"
    >
      {showImage ? (
        <img
          src={src ?? undefined}
          alt=""
          className="size-full object-cover"
          onError={() => setHasImageFailed(true)}
          loading="lazy"
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
