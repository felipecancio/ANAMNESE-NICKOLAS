import { injurySample } from "../lib/fixtures";

async function main() {
  const answers = injurySample();
  answers.startedAt = Date.now() - 20_000;
  const response = await fetch("http://localhost:3055/api/avaliacoes", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: "http://localhost:3055" },
    body: JSON.stringify({
      answers,
      clientRequestId: `browser-test-${Date.now()}`,
    }),
  });
  const json = await response.json();
  console.log(response.status, JSON.stringify(json, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
