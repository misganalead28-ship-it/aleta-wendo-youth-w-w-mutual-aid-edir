import React, { useState } from 'react';

interface MemberAvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const MemberAvatar: React.FC<MemberAvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const [failed, setFailed] = useState(false);

  const dims =
    size === 'sm'
      ? 'w-8 h-8 text-xs'
      : size === 'md'
      ? 'w-10 h-10 text-sm'
      : size === 'lg'
      ? 'w-16 h-16 text-lg'
      : 'w-24 h-24 text-2xl';

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('');

  if (!src || failed) {
    return (
      <div
        className={`${dims} rounded-lg bg-[#0E4D34] text-white font-semibold flex items-center justify-center shrink-0 select-none ${className}`}
        aria-label={name}
      >
        {initials || 'AW'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`${dims} rounded-lg object-cover border border-[#E2E6E3] shrink-0 bg-[#EEF1EE] ${className}`}
    />
  );
};
