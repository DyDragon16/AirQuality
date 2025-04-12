"use client";

interface ClientBodyProps {
  children: React.ReactNode;
  className: string;
}

export function ClientBody({ children, className }: ClientBodyProps) {
  return (
    <body className={className}>
      {children}
    </body>
  );
} 