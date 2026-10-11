import React from 'react';

export function InstagramLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ig-gradient-fill" cx="15%" cy="100%" r="125%" fx="15%" fy="100%">
          <stop offset="0%" stopColor="#fdf497" />
          <stop offset="10%" stopColor="#fdf497" />
          <stop offset="45%" stopColor="#fd5949" />
          <stop offset="65%" stopColor="#d6249f" />
          <stop offset="90%" stopColor="#285AEB" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="6" fill="url(#ig-gradient-fill)" />
      <rect x="5" y="5" width="14" height="14" rx="4" stroke="#ffffff" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.4" stroke="#ffffff" strokeWidth="1.6" />
      <circle cx="15.8" cy="8.2" r="0.9" fill="#ffffff" />
    </svg>
  );
}

export function FacebookLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#1877F2" />
      <path
        d="M14.6 12.3l.4-2.6h-2.5V8.02c0-.71.35-1.4 1.46-1.4h1.13V4.41s-1.03-.18-2.01-.18c-2.05 0-3.38 1.24-3.38 3.48v1.98H7.4v2.61h2.3V19.7c.46.07.93.11 1.41.11.48 0 .95-.04 1.41-.11V12.3h2.08z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function LinkedInLogo({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="5" fill="#0A66C2" />
      <path
        d="M7.7 9H5.3v7.7h2.4V9zM6.5 5.5c-.8 0-1.4.6-1.4 1.4s.6 1.4 1.4 1.4 1.4-.6 1.4-1.4-.6-1.4-1.4-1.4zm12.2 6.6c0-2.4-1.3-3.5-3-3.5-1.4 0-2 .8-2.3 1.4V9h-2.4c.03.7 0 7.7 0 7.7h2.4v-4.3c0-.23.02-.46.08-.62.19-.46.63-.94 1.37-.94.97 0 1.36.74 1.36 1.82v4.04h2.4v-4.5z"
        fill="#ffffff"
      />
    </svg>
  );
}
