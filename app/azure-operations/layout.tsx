import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'SONIC-Academy | Azure Server Maintenance & Recovery',
  description:
    'Practise pilot-first Windows and RHEL updates, Azure snapshots, backup, rolling reboots and recovery.',
};
export default function AzureOperationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
