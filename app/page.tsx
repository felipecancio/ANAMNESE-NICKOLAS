import { Footer, ForWhom, Header, Hero, HowItWorks } from "@/components/landing/Landing";
import { AssessmentWizard } from "@/components/form/AssessmentWizard";
import { getStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const settings = await (await getStore()).getSettings();
  return (
    <>
      <Header settings={settings} />
      <main id="conteudo">
        <Hero settings={settings} />
        <ForWhom />
        <HowItWorks />
        <AssessmentWizard />
      </main>
      <Footer settings={settings} />
    </>
  );
}
