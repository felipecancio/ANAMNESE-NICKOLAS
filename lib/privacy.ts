import { SITE } from "./site";
import type { SiteSettings } from "./types";

export function privacyCopy(settings: SiteSettings) {
  const controller = settings.responsibleName || SITE.professionalName;
  const email = settings.responsibleEmail || "o e-mail cadastrado no painel administrativo";
  const retention = settings.retentionNote?.trim()
    ? settings.retentionNote.trim()
    : "prazo de retenção a definir pelo responsável, limitado ao necessário para a avaliação inicial e o acompanhamento solicitado";

  return {
    controller,
    email,
    retention,
  };
}
