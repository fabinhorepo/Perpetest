import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mata Sagrada Ambiental - Marketplace de Mudas Florestais",
  description: "Plataforma de e-commerce para viveiro de mudas florestais com logística otimizada",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
