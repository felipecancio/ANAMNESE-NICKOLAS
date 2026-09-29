# Consultoria do Professor Nickolas Amaral

Landing page e anamnese inicial em português do Brasil. As respostas são validadas no servidor, gravadas de forma privada e transformadas em PDF tabular para o professor. O envio automático do PDF usa a WhatsApp Cloud API; o link `wa.me` apenas abre a conversa do visitante com o protocolo.

## O que já está pronto

- Página pública responsiva, sem depoimentos, preços, CREF ou resultados clínicos inventados.
- Formulário em 7 etapas, com ramificações, triagem e interrupção em sintomas potencialmente urgentes (orientação para o SAMU 192).
- PDF gerado no servidor, com todas as perguntas e “Não se aplica” quando a lógica condicional pula um bloco.
- Painel administrativo com senha, listagem, download do PDF, cadastro de foto/CREF e reenvio.
- Banco SQLite local (`data/avaliacoes.db`) e schema equivalente para Supabase.

## Configuração local

1. Copie `.env.example` para `.env.local`.
2. Defina `ADMIN_PASSWORD` e um `ADMIN_SESSION_SECRET` com pelo menos 32 caracteres.
3. Instale e inicie:

```bash
npm install
npm test
npm run test:pdf
npm run dev
```

4. Abra `http://localhost:3000`. O painel fica em `/admin`.
5. O PDF de teste é gravado em `data/test-output/avaliacao-teste.pdf` (nome fictício, sem dados reais).

Não grave respostas de saúde no `localStorage`. O formulário mantém as etapas apenas na sessão da página.

## WhatsApp Business Platform (envio automático do PDF)

O número `5522997231553` é o **destino**. Ele **não** envia a mensagem para si mesmo. O remetente é o número da Cloud API, identificado por `WHATSAPP_PHONE_NUMBER_ID`.

1. Crie um app em [developers.facebook.com](https://developers.facebook.com/) e adicione **WhatsApp**.
2. Cadastre (ou use o número de teste) como remetente. Anote o **Phone number ID**.
3. Gere um token de acesso permanente do sistema (ou token temporário só para homologação).
4. Preencha no servidor:

- `WHATSAPP_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID` (remetente)
- `WHATSAPP_DESTINATION=5522997231553`
- `WHATSAPP_APP_SECRET`
- `WHATSAPP_WEBHOOK_VERIFY_TOKEN`

5. Webhook: `https://SEU_DOMINIO/api/webhooks/whatsapp`  
   Campos: `messages`, `message_deliveries`. Verifique a assinatura `x-hub-signature-256`.
6. Envie uma avaliação de teste **antes** de publicar a página como concluída. No painel, o status deve passar de `pendente` para `enviado` e, com webhook, `entregue`.
7. Se as credenciais estiverem vazias, o PDF **não** é anunciado como enviado. Ele permanece no painel com status `Integração pendente`.

Reenvio: no detalhe da avaliação, use **Reenviar PDF pelo WhatsApp**. Não há reenvio automático infinito; falhas de credencial não são repetidas às cegas.

## Publicação

- Sirva o site em **HTTPS**.
- Mantenha `.env` só no servidor. Nunca commite tokens.
- Recomenda-se VPS Node (`npm run build && npm start`) para o SQLite local persistir. Na Vercel, use Postgres/Supabase (`supabase/schema.sql`) e armazene PDFs em bucket **privado**.
- Cadastre foto real e CREF no painel somente com dados verificados.
- Defina o prazo de retenção na política (campo do painel). Enquanto vazio, o texto permanece “prazo a definir”.
- Teste: ramificações, pessoa com 60+ anos, urgência (dor no peito), PDF completo, clique no `wa.me`, falha/reenvio da API e login do admin.

## Privacidade

Respostas de saúde não vão para Meta Pixel, Google Analytics, URLs de marketing ou logs comuns. PDFs não têm URL pública permanente: o download exige sessão administrativa. Coleta mínima: sem CPF, endereço completo ou upload de exames.
