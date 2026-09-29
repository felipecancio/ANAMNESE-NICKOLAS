import type { Metadata } from "next";
import { Figtree, Fraunces } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

const sans = Figtree({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `${SITE.professionalName} · Avaliação inicial`,
    description:
      "Acompanhamento individualizado com exercícios funcionais e treinos direcionados para pessoas com histórico de lesões, dores, perda de mobilidade ou dificuldades físicas relacionadas ao envelhecimento.",
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.svg" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cref = process.env.NEXT_PUBLIC_CREF || "";

  return (
    <html lang="pt-BR" className={`${sans.variable} ${serif.variable}`}>
      <body className="grain min-h-screen antialiased" data-cref={cref ? "cadastrado" : "pendente"}>
        <a className="skip-link" href="#conteudo">
          Ir para o conteúdo
        </a>
        <a className="skip-link" href="#avaliacao" style={{ left: "11rem" }}>
          Ir para a avaliação
        </a>
        {children}
      </body>
    </html>
  );
}
