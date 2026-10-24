import { useId } from 'react';

// Two presentation layers use the same original PNG; only the lettering moves.
export function BrandLogo({ className = '', label = 'Cloud Seam Tech', wording = 'black' }: { className?: string; label?: string; wording?: 'black' | 'white' }) {
  const id = useId().replace(/:/g, '');
  return (
    <span className={`spaced-brand-logo ${className}`} role="img" aria-label={label}>
      <svg className="brand-art-layer" viewBox="0 0 2030 775" aria-hidden="true">
        <defs><clipPath id={`${id}-cloud`}><polygon points="0,0 925,0 925,313 924,314 924,315 925,316 925,320 924,321 922,322 924,323 924,324 926,325 926,326 923,327 925,328 925,333 922,334 922,335 924,336 924,358 918,359 918,360 925,361 925,365 920,366 926,367 926,370 924,371 927,372 925,373 925,377 924,378 924,379 925,380 925,424 926,425 924,426 924,427 925,428 925,430 926,431 926,433 927,434 927,435 930,436 928,437 928,439 929,440 929,442 932,443 930,444 930,446 933,447 931,448 931,451 932,452 932,457 933,458 933,467 934,468 934,484 936,485 936,486 933,487 933,494 935,495 932,496 932,500 937,501 931,502 931,506 930,507 934,508 930,509 930,510 934,511 929,512 929,513 939,514 928,515 928,516 930,517 927,518 927,520 926,521 926,522 928,523 925,524 925,525 927,526 924,527 924,528 926,529 925,530 925,774 0,775" /></clipPath></defs>
        <image href="/cloudseam-logo.png" width="2030" height="775" clipPath={`url(#${id}-cloud)`} />
      </svg>
      <svg className="brand-art-layer brand-lettering-layer" viewBox="0 0 2030 775" aria-hidden="true">
        <defs><clipPath id={`${id}-letters`}><polygon points="2030,0 925,0 925,313 924,314 924,315 925,316 925,320 924,321 922,322 924,323 924,324 926,325 926,326 923,327 925,328 925,333 922,334 922,335 924,336 924,358 918,359 918,360 925,361 925,365 920,366 926,367 926,370 924,371 927,372 925,373 925,377 924,378 924,379 925,380 925,424 926,425 924,426 924,427 925,428 925,430 926,431 926,433 927,434 927,435 930,436 928,437 928,439 929,440 929,442 932,443 930,444 930,446 933,447 931,448 931,451 932,452 932,457 933,458 933,467 934,468 934,484 936,485 936,486 933,487 933,494 935,495 932,496 932,500 937,501 931,502 931,506 930,507 934,508 930,509 930,510 934,511 929,512 929,513 939,514 928,515 928,516 930,517 927,518 927,520 926,521 926,522 928,523 925,524 925,525 927,526 924,527 924,528 926,529 925,530 925,774 2030,775" /></clipPath></defs>
        <defs>
          <clipPath id={`${id}-word-colors`}><rect width="2030" height="460" /><rect x="1480" y="460" width="550" height="315" /></clipPath>
          <filter id={`${id}-word-ink`} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values={`0 0 0 0 ${wording === 'white' ? 1 : 0} 0 0 0 0 ${wording === 'white' ? 1 : 0} 0 0 0 0 ${wording === 'white' ? 1 : 0} 0 0 0 1 0`} />
          </filter>
        </defs>
        <g clipPath={`url(#${id}-letters)`}>
          <image href="/cloudseam-logo.png" width="2030" height="775" />
          <g clipPath={`url(#${id}-word-colors)`}>
            <image href="/cloudseam-logo.png" width="2030" height="775" filter={`url(#${id}-word-ink)`} />
          </g>
        </g>
      </svg>
    </span>
  );
}
