import { useQuery } from "@tanstack/react-query";

export interface CasaArbbet {
  grupo: string;
  empresa: string;
  casa: string;
  pa: boolean;
  tipoChavePix: string;
  estat: string;
  kyc: string;
}

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQf6MJx-ycrlMkz7N3C_KaeWOpBN9K--cOZCU630YXo5V1qZAgbC6OSkCAxwTeHGV5mT-B7Xxn94uxm/pub?gid=1888270144&single=true&output=csv";

function parseCSV(csvText: string): CasaArbbet[] {
  const lines = csvText.split("\n");
  if (lines.length < 2) return [];

  const casas: CasaArbbet[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV handling quoted values
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (values.length >= 7) {
      const casa: CasaArbbet = {
        grupo: values[0] || "",
        empresa: values[1] || "",
        casa: values[2] || "",
        pa: values[3]?.toUpperCase() === "SIM" || values[3]?.toUpperCase() === "S",
        tipoChavePix: values[4] || "",
        estat: values[5] || "",
        kyc: values[6] || "",
      };

      // Only add if has a valid casa name
      if (casa.casa) {
        casas.push(casa);
      }
    }
  }

  return casas;
}

async function fetchCasasArbbet(): Promise<CasaArbbet[]> {
  const response = await fetch(CSV_URL);
  if (!response.ok) {
    throw new Error("Falha ao carregar dados das casas");
  }
  const csvText = await response.text();
  return parseCSV(csvText);
}

export function useCasasArbbet() {
  return useQuery({
    queryKey: ["casas-arbbet"],
    queryFn: fetchCasasArbbet,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}
