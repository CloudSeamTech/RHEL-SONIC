import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'SONIC | Agency-to-Azure Migration',
  description:
    'A task-first, evidence-driven agency-to-Azure migration lab with safe local PowerShell, Azure CLI, and WSL terminal support.',
};

export default function MigrationLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
