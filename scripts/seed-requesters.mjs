import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnv() {
  try {
    const env = readFileSync(join(root, ".env.local"), "utf8");
    const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.+)/)?.[1]?.trim();
    const key = env.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.+)/)?.[1]?.trim();
    return { url, key };
  } catch {
    return { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY };
  }
}

const NAMES = [
  "Adriano Correia", "Adriano Luz", "Alceu Filho", "Alexandro Silva",
  "Amanda Silva", "Ana Carla", "Ariane Januario", "Arlete Fraga",
  "Dagmara Amorim", "Daniel Filho", "Douglas Oliveira", "Edilaine Bandeira",
  "Emanoelli Vitória", "Fernanda Nunes", "Filipe Silva", "Gabrielaa Fagundes",
  "Gleydson Saraiva", "Guilherme Werpp", "Hugo Leonardo", "Jairo Rodrigues",
  "Jessica Dias", "Jessica Reis", "João Carlos", "Lucas Martins",
  "Luiza Araujo", "Luma Amorim", "Magna Marques", "Marivaldo Silva",
  "Matheus Mendes", "Matheus Padilha", "Mônica Melo", "Nilza Jungklaus",
  "Pablo Ferreira", "Pedro Rodrigues", "Robert Emanuel", "Sammia Cordeiro",
  "Theisy Vieira", "Tiago Santos", "Vanessa Fagundes", "Wallacy Nascimento",
];

const { url, key } = loadEnv();
if (!url || !key) {
  console.error("Configure .env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

const { data: existing, error: listError } = await supabase
  .from("requesters")
  .select("name");

if (listError) {
  console.error("Erro: tabela requesters não existe. Execute supabase/migration-v2.sql no Supabase primeiro.");
  console.error(listError.message);
  process.exit(1);
}

const existingNames = new Set((existing ?? []).map((r) => r.name));
const toInsert = NAMES.filter((n) => !existingNames.has(n)).map((name) => ({ name }));

if (toInsert.length === 0) {
  console.log("Todos os solicitantes já estão cadastrados.");
  process.exit(0);
}

const { error } = await supabase.from("requesters").insert(toInsert);

if (error) {
  console.error("Erro ao inserir:", error.message);
  process.exit(1);
}

console.log(`Inseridos ${toInsert.length} solicitantes com sucesso.`);
