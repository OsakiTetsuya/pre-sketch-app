import React from 'react';

interface BigButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'ghost';
  size?: 'normal' | 'large' | 'icon';
  children: React.ReactNode;
}

export const BigButton: React.FC<BigButtonProps> = ({
  variant = 'primary',
  size = 'normal',
  className = '',
  disabled,
  children,
  ...props
}) => {
  const baseStyles =
    'relative flex items-center justify-center font-extrabold select-none touch-manipulation transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer rounded-3xl shadow-md border-b-4 active:border-b-0 active:translate-y-1';

  const sizeStyles = {
    normal: 'min-w-[64px] min-h-[64px] px-6 py-4 text-xl',
    large: 'min-w-[80px] min-h-[80px] px-10 py-6 text-2xl',
    icon: 'w-16 h-16 min-w-[64px] min-h-[64px] p-0 text-xl rounded-full',
  };

  const variantStyles = {
    primary: 'bg-sky-400 hover:bg-sky-500 text-white border-sky-600 active:bg-sky-500',
    secondary: 'bg-amber-400 hover:bg-amber-500 text-amber-950 border-amber-600 active:bg-amber-500',
    accent: 'bg-pink-400 hover:bg-pink-500 text-white border-pink-600 active:bg-pink-500',
    danger: 'bg-rose-400 hover:bg-rose-500 text-white border-rose-600 active:bg-rose-500',
    ghost: 'bg-white/80 hover:bg-white text-slate-700 border-slate-300 active:bg-slate-100 shadow-none border-b-2',
  };

  return (
    <button
      disabled={disabled}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
