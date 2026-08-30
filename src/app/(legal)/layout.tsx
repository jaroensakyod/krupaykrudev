export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <div className="max-w-3xl mx-auto px-6 py-12 prose prose-sm max-w-none">{children}</div>;
}
