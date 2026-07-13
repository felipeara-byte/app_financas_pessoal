import type { Category } from "@/lib/constants/categories";
import type { ParsedRow } from "./santander-parser";

const CARD_LABEL = "Cartão Santander";

const START_MARKER = "Detalhamento da Fatura";
const END_MARKER = "Resumo da Fatura";

const CLOSING_DATE_RE = /realizados\s+at[ée]\s+(\d{2})\/(\d{2})/i;
const DUE_DATE_RE = /Vencimento\s*\n\s*(\d{2})\/(\d{2})\/(\d{4})/;

const CREDITS_HEADER_RE = /^Pagamento e Demais Créditos$/i;
const PURCHASES_HEADER_RE = /^(Parcelamentos|Despesas)$/i;
const CARDHOLDER_RE = /^@?[A-ZÀ-Ú ]+ - \d{4} XXXX XXXX \d{4}$/;
const COLUMN_HEADER_RE = /^Compra Data Descri/i;
const VALOR_TOTAL_RE = /^VALOR TOTAL/i;

const MONEY_RE = /^-?\d{1,3}(?:\.\d{3})*,\d{2}$/;
const PARCELA_RE = /^\d+\/\d+$/;
const DATE_DESC_RE = /^(\d{2})\/(\d{2})\s+(.+)$/;

function parseAmount(str: string): number {
  return parseFloat(str.replace(/\./g, "").replace(",", "."));
}

const CATEGORY_KEYWORDS: Array<{ category: Category; keywords: string[] }> = [
  {
    category: "Transporte",
    keywords: ["ESTAC", "PARK", "POSTO", "GARAGE", "COMBUSTIVEL", "UBER"],
  },
  {
    category: "Saúde",
    keywords: ["FARMA", "DROGARIA", "DROGASIL", "HOSPITAL", "CLINICA", "DENTISTA"],
  },
  {
    category: "Alimentação",
    keywords: [
      "SAPORE",
      "PADARIA",
      "PIZZARIA",
      "TAPIOCA",
      "RESTAURANTE",
      "LANCHONETE",
      "ALIMENTACAO",
      "MERCADO",
      "SUPERMERCADO",
      "ACOUGUE",
      "IFOOD",
      "SONDA",
    ],
  },
  {
    category: "Lazer",
    keywords: ["CINEMA", "NETFLIX", "SPOTIFY", "SHOPPING", "TEATRO", "SHOW"],
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

function guessCategory(description: string): Category {
  const normalized = normalize(description);
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((kw) => normalized.includes(normalize(kw)))) {
      return category;
    }
  }
  return "Outros";
}

interface ParsedLine {
  description: string;
  parcela: string | null;
  day: string;
  month: string;
  amount: number;
}

function parseLine(line: string): ParsedLine | null {
  const parts = line
    .split("\t")
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  if (parts.length === 0) return null;

  let amountStr: string;
  let remaining: string[];
  const last = parts[parts.length - 1];
  const secondLast = parts.length >= 2 ? parts[parts.length - 2] : undefined;
  if (secondLast && MONEY_RE.test(secondLast) && MONEY_RE.test(last)) {
    amountStr = secondLast;
    remaining = parts.slice(0, -2);
  } else if (MONEY_RE.test(last)) {
    amountStr = last;
    remaining = parts.slice(0, -1);
  } else {
    return null;
  }

  let parcela: string | null = null;
  let dateDesc: string | null = null;
  for (const part of remaining) {
    if (PARCELA_RE.test(part)) {
      parcela = part;
      continue;
    }
    const match = part.match(DATE_DESC_RE);
    if (match) {
      dateDesc = part;
    }
  }
  if (!dateDesc) return null;
  const match = dateDesc.match(DATE_DESC_RE)!;

  const amount = parseAmount(amountStr);
  if (amount <= 0) return null;

  return {
    description: match[3].replace(/\s+/g, " ").trim(),
    parcela,
    day: match[1],
    month: match[2],
    amount,
  };
}

/**
 * Parses the itemized "Detalhamento da Fatura" section of a Santander credit
 * card statement into individual purchase-level transactions -- so recurring
 * "PAGAMENTO CARTAO CREDITO" lump-sum lines on the checking-account statement
 * can be skipped in favor of each real underlying expense.
 *
 * "Despesas" rows are dated within the statement's own billing period, so
 * their printed day/month is used directly. "Parcelamentos" rows show the
 * *original* purchase date (which can be many cycles in the past and whose
 * year can't be reliably reconstructed from the parcela fraction alone), so
 * those are dated to this statement's own closing date instead -- that's
 * when this installment's amount actually hit the card this cycle -- while
 * the original purchase date is kept in the description for context.
 */
export function parseSantanderFatura(rawText: string): ParsedRow[] {
  const closingMatch = rawText.match(CLOSING_DATE_RE);
  const dueMatch = rawText.match(DUE_DATE_RE);
  if (!closingMatch || !dueMatch) {
    throw new Error(
      "Não foi possível identificar o período da fatura. O arquivo é uma fatura do cartão Santander?"
    );
  }
  const closingMonth = Number(closingMatch[2]);
  const closingDay = closingMatch[1];
  const dueMonth = Number(dueMatch[2]);
  const dueYear = Number(dueMatch[3]);
  const closingYear = closingMonth <= dueMonth ? dueYear : dueYear - 1;

  const startIdx = rawText.indexOf(START_MARKER);
  const endIdx = rawText.indexOf(END_MARKER);
  if (startIdx === -1) {
    throw new Error("Não foi possível encontrar o detalhamento da fatura no PDF.");
  }
  const windowText = rawText.slice(
    startIdx + START_MARKER.length,
    endIdx >= 0 ? endIdx : rawText.length
  );

  const lines = windowText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const rows: ParsedRow[] = [];
  let section: "credits" | "installment" | "expense" | null = null;

  for (const line of lines) {
    if (CARDHOLDER_RE.test(line)) {
      section = null;
      continue;
    }
    if (CREDITS_HEADER_RE.test(line)) {
      section = "credits";
      continue;
    }
    if (PURCHASES_HEADER_RE.test(line)) {
      section = /^Parcelamentos$/i.test(line) ? "installment" : "expense";
      continue;
    }
    if (COLUMN_HEADER_RE.test(line)) continue;
    if (VALOR_TOTAL_RE.test(line)) {
      section = null;
      continue;
    }
    if (section === null || section === "credits") continue;

    const parsed = parseLine(line);
    if (!parsed) continue;

    let date: string;
    let description = parsed.description;
    if (section === "installment") {
      date = `${closingYear}-${String(closingMonth).padStart(2, "0")}-${closingDay}`;
      description = parsed.parcela
        ? `${description} (parcela ${parsed.parcela}, compra orig. ${parsed.day}/${parsed.month})`
        : description;
    } else {
      const year = Number(parsed.month) <= closingMonth ? closingYear : closingYear - 1;
      date = `${year}-${parsed.month}-${parsed.day}`;
    }

    rows.push({
      date,
      description: `${CARD_LABEL} - ${description}`,
      amount: parsed.amount,
      type: "expense",
      category: guessCategory(parsed.description),
      selected: true,
    });
  }

  return rows;
}
