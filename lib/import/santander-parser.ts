import type { Category } from "@/lib/constants/categories";

export interface ParsedRow {
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  type: "income" | "expense";
  category: Category;
  selected: boolean;
}

const MONTH_NAMES: Record<string, string> = {
  janeiro: "01",
  fevereiro: "02",
  março: "03",
  abril: "04",
  maio: "05",
  junho: "06",
  julho: "07",
  agosto: "08",
  setembro: "09",
  outubro: "10",
  novembro: "11",
  dezembro: "12",
};

const HEADER_MARKER = "Saldo (R$)";
const END_MARKER = "Se você não tem Limite da Conta";

const NOISE_LINE_PATTERNS: RegExp[] = [
  /^SALDO EM/i,
  /^Data\s+Descrição\s+Nº Documento/i,
  /^EXTRATO CONSOLIDADO INTELIGENTE$/i,
  /^(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\/\d{4}$/i,
  /^Extrato_PF_A4_Inteligente/i,
  /^BALP_/i,
  /^Pagina:\s*\d+\/\d+$/i,
  /^--\s*\d+\s+of\s+\d+\s*--$/i,
];

const VALUE_TAIL_RE =
  /(?:^|\s)(-|\d+)\s+(\d{1,3}(?:\.\d{3})*,\d{2})(-)?(?:\s+(\d{1,3}(?:\.\d{3})*,\d{2}))?\s*$/;
const DATE_PREFIX_RE = /^(\d{2}\/\d{2})\s+(.*)$/;
const MONTH_YEAR_RE =
  /(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\/(\d{4})/i;

function parseAmount(str: string): number {
  return parseFloat(str.replace(/\./g, "").replace(",", "."));
}

const CATEGORY_KEYWORDS: Array<{ category: Category; keywords: string[] }> = [
  {
    category: "Moradia",
    keywords: [
      "COMGAS",
      "ENEL",
      "ENERGIA ELETRICA",
      "CLARO",
      "VIVO MOVEL",
      "TV A CABO",
      "TELEFONE CELULAR",
      "CONDOMINIO",
      "ALUGUEL",
      "EDIFICIO",
    ],
  },
  {
    category: "Transporte",
    keywords: [
      "LICENCIAMENTO VEICULO",
      "ESTAC",
      "GARAGE",
      "COMBUSTIVEL",
      "POSTO",
      "UBER",
    ],
  },
  {
    category: "Saúde",
    keywords: [
      "FARMACIA",
      "DROGARIA",
      "HOSPITAL",
      "CLINICA",
      "DENTISTA",
      "MEDIC",
    ],
  },
  {
    category: "Alimentação",
    keywords: [
      "MERCADO",
      "SUPERMERCADO",
      "RESTAURANTE",
      "IFOOD",
      "PADARIA",
      "ACOUGUE",
    ],
  },
  {
    category: "Lazer",
    keywords: ["CINEMA", "NETFLIX", "SPOTIFY", "SHOW", "AQUARIO", "TEATRO"],
  },
  {
    category: "Educação",
    keywords: ["ESCOLA", "CURSO", "FACULDADE", "COLEGIO"],
  },
];

const COMBINING_DIACRITICS_RE = new RegExp("[\\u0300-\\u036f]", "g");

function normalize(text: string): string {
  return text.normalize("NFD").replace(COMBINING_DIACRITICS_RE, "").toUpperCase();
}

function guessCategory(description: string, type: "income" | "expense"): Category {
  const normalized = normalize(description);

  if (type === "income") {
    if (normalized.includes("LIQUIDO DE VENCIMENTO") || normalized.includes("SALARIO")) {
      return "Salário";
    }
    return "Outros";
  }

  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => normalized.includes(normalize(kw)))) {
      return category;
    }
  }
  return "Outros";
}

function isNoiseLine(line: string): boolean {
  return NOISE_LINE_PATTERNS.some((re) => re.test(line));
}

/**
 * Parses the Santander "Extrato Consolidado Inteligente" ledger table out of
 * pdf-parse's raw text output. Layout confirmed against three real
 * statements: transactions span 1-3 loosely joined lines, columns are
 * tab-separated where present, and a trailing "-" directly after the amount
 * digits marks an expense (no trailing sign = income).
 */
export function parseSantanderStatement(rawText: string): ParsedRow[] {
  const monthYearMatch = rawText.match(MONTH_YEAR_RE);
  if (!monthYearMatch) {
    throw new Error(
      "Não foi possível identificar o mês/ano do extrato. O arquivo é um Extrato Consolidado Inteligente do Santander?"
    );
  }
  const month = MONTH_NAMES[monthYearMatch[1].toLowerCase()];
  const year = monthYearMatch[2];

  const startIdx = rawText.indexOf(HEADER_MARKER);
  const endIdx = rawText.indexOf(END_MARKER);
  if (startIdx === -1) {
    throw new Error(
      "Não foi possível encontrar a tabela de movimentação no PDF."
    );
  }
  const windowText = rawText.slice(
    startIdx + HEADER_MARKER.length,
    endIdx >= 0 ? endIdx : rawText.length
  );

  const lines = windowText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !isNoiseLine(l));

  const rows: ParsedRow[] = [];
  let activeDay: string | null = null;
  let buffer: string[] = [];
  let awaitingValue = false;

  for (let line of lines) {
    if (!awaitingValue) {
      const dateMatch = line.match(DATE_PREFIX_RE);
      if (dateMatch) {
        activeDay = dateMatch[1].slice(0, 2);
        line = dateMatch[2];
      }
    }

    const tailMatch = line.match(VALUE_TAIL_RE);
    if (tailMatch) {
      const prefix = line.slice(0, tailMatch.index).trim();
      if (prefix) buffer.push(prefix);
      const description = buffer.join(" ").replace(/\s+/g, " ").trim();
      buffer = [];
      awaitingValue = false;

      if (!activeDay) continue; // malformed line with no date context, skip

      const type: "income" | "expense" = tailMatch[3] === "-" ? "expense" : "income";
      const amount = parseAmount(tailMatch[2]);
      const isInterest = /REMUNERACAO APLICACAO/i.test(description);

      rows.push({
        date: `${year}-${month}-${activeDay}`,
        description,
        amount,
        type,
        category: guessCategory(description, type),
        selected: !isInterest,
      });
    } else {
      buffer.push(line);
      awaitingValue = true;
    }
  }

  return rows;
}
