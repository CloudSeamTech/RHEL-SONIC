import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'SONIC-Academy | Tenable Nessus Training',
  description:
    'Guided Nessus 10.12.5 installation and vulnerability-scanning classes for authorized practice labs.',
};
export default function NessusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
