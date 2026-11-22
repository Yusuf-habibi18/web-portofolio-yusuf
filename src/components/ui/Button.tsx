import type { MouseEvent, ReactNode } from 'react';
import { ArrowUpRight } from './Icons';
import { Magnetic } from './Magnetic';

type Props = {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'outline' | 'light';
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
  external?: boolean;
  icon?: ReactNode;
  className?: string;
};

const styles = {
  primary: 'bg-royal text-surface hover:bg-ink',
  outline: 'border border-ink/80 text-ink hover:border-royal hover:bg-royal hover:text-surface',
  light: 'bg-paper text-ink hover:bg-royal hover:text-surface',
};

/** Pill link whose arrow slides out and back in on hover. */
export function Button({ href, children, variant = 'primary', onClick, external, icon, className = '' }: Props) {
  return (
    <Magnetic>
    <a
      href={href}
      onClick={onClick}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
      className={`group relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full pr-2 pl-6 text-[0.9375rem] font-medium transition-colors duration-300 ${styles[variant]} ${className}`}
    >
      {variant === 'primary' && (
        <span
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[150%] -skew-x-12 bg-white/25 transition-transform duration-700 ease-out group-hover:translate-x-[420%]"
          aria-hidden
        />
      )}
      <span className="relative">{children}</span>
      <span className="relative grid size-8 place-items-center overflow-hidden rounded-full">
        <span className="transition-transform duration-500 ease-out-expo group-hover:translate-x-6 group-hover:-translate-y-6">
          {icon ?? <ArrowUpRight size={18} />}
        </span>
        <span className="absolute -translate-x-6 translate-y-6 transition-transform duration-500 ease-out-expo group-hover:translate-x-0 group-hover:translate-y-0">
          {icon ?? <ArrowUpRight size={18} />}
        </span>
      </span>
    </a>
    </Magnetic>
  );
}
