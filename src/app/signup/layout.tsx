import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create Your Free Account | BildPro',
};

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
