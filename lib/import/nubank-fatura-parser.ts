import type { Category } from "@/lib/constants/categories";
import type { ParsedRow } from "./santander-parser";

const CARD_LABEL = "Cartão Nubank";

// The itemized purchases live between the first "TRANSAÇÕES DE ..." header and
// the trailing "Pagamentos e Financiamentos" block (payments, interest, fines,
// IOF) -- which are not purchases and must be skipped.
const START_MARKER = "TRANSAÇÕES DE";
const END_MARKER = "Pagamentos e Financiamentos";

// "Data de vencimento: 20 JAN 2026"
const DUE_DATE_RE = /Data de vencimento:\s*(\d{2})\s+([A-ZÇÃa-zçã]{3})\s+(\d{4})/;

const MONTHS: Record<string, string> = {
  JAN: "01",
  FEV: "02",
  MAR: "03",
  ABR: "04",
  MAI: "05",
  JUN: "06",
  JUL: "07",
  AGO: "08",
  SET: "09",
  OUT: "10",
  NOV: "11",
  DEZ: "12",
};

const MONTH_ALT = Object.keys(MONTHS).join("|");

// <DD> <MMM> <middle> [−|-]R$ <amount>  (single-line transaction)
// `middle` holds an optional card mask (•••• 5088) plus the description.
const TX_RE = new RegExp(
  `^(\\d{2})\\s+(${MONTH_ALT})\\s+(.*?)\\s+(−|-)?R\\$\\s*([\\d.]+,\\d{2})$`
);

// A line that starts with a date but carries no trailing amount -- the opening
// line of a multi-line entry (e.g. long refunds), whose amount lands on a later
// line by itself.
const DATE_LINE_RE = new RegExp(`^(\\d{2})\\s+(${MONTH_ALT})\\s+(.*\\S)$`);

// A line that is nothing but an amount, e.g. "−R$ 59,90".
const AMOUNT_ONLY_RE = /^(−|-)?R\$\s*([\d.]+,\d{2})$/;

// Leading card mask like "•••• 5088 ": a run of symbol chars, then 4 digits.
// Anchored on the symbol run so descriptions that merely start with a digit
// (e.g. "0 Sao Caetano") are left untouched.
const CARD_MASK_RE = /^[^\w\sÀ-ú]+\s*\d{4}\s+/u;

const PARCELA_RE = /\s*-\s*Parcela\s+(\d+\/\d+)\s*$/i;

function parseAmount(str: string): number {
  return parseFloat(str.replace(/\./g, "").replace(",", "."));
}

const CATEGORY_KEYWORDS: Array<{ category: Category; keywords: string[] }> = [
  {
    category: "Transporte",
    keywords: ["UBER", "99", "ESTAC", "PARK", "POSTO", "COMBUSTIVEL", "ZUL", "NUTAG"],
  },
  {
    category: "Saúde",
    keywords: ["FARMA", "DROGARIA", "DROGASIL", "HOSPITAL", "CLINICA", "DENTISTA"],
  },
  {
    category: "Alimentação",
    keywords: [
      "IFOOD",
      "IFD",
      "RESTAURANTE",
      "LANCHONETE",
      "PIZZ",
      "BURGER",
      "MERCADO",
      "SUPERMERCADO",
      "ACOUGUE",
      "CARNES",
      "PADARIA",
      "SORVET",
      "GELATO",
      "OFNER",
    ],
  },
  {
    category: "Lazer",
    keywords: [
      "CINEMA",
      "CINEMARK",
      "NETFLIX",
      "SPOTIFY",
      "DISNEY",
      "YOUTUBE",
      "PLAYSTATION",
      "SONYPLAY",
      "TICKETMASTER",
      "SHOW",
      "TEATRO",
      "AQUARIO",
    ],
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

/**
 * Parses the "TRANSAÇÕES" section of a Nubank credit card statement (fatura)
 * into individual purchase-level transactions.
 *
 * Like the Santander fatura parser, every row is dated to the statement's due
 * date ("Data de vencimento"), not the day the purchase happened -- that's when
 * the money actually leaves the paying account, so monthly totals reconcile
 * against the bank statement instead of scattering one bill across the months
 * its purchases occurred in. The original purchase day/month is kept in the
 * description for context.
 *
 * Refunds ("Estorno ...", shown with a negative amount) are already netted into
 * the invoice total, so they're imported as income to keep the period balance
 * correct.
 */
export function parseNubankFatura(rawText: string): ParsedRow[] {
  const dueMatch = rawText.match(DUE_DATE_RE);
  if (!dueMatch) {
    throw new Error(
      "Não foi possível identificar o vencimento da fatura. O arquivo é uma fatura do cartão Nubank?"
    );
  }
  const dueMonth = MONTHS[dueMatch[2].toUpperCase()];
  if (!dueMonth) {
    throw new Error("Não foi possível interpretar a data de vencimento da fatura.");
  }
  const paymentDate = `${dueMatch[3]}-${dueMonth}-${dueMatch[1]}`;

  const startIdx = rawText.indexOf(START_MARKER);
  if (startIdx === -1) {
    throw new Error("Não foi possível encontrar as transações no PDF.");
  }
  const endIdx = rawText.indexOf(END_MARKER, startIdx);
  const windowText = rawText.slice(
    startIdx,
    endIdx >= 0 ? endIdx : rawText.length
  );

  const lines = windowText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const rows: ParsedRow[] = [];

  function pushRow(
    day: string,
    monthAbbr: string,
    middleRaw: string,
    sign: string | undefined,
    amountStr: string
  ): void {
    const amount = parseAmount(amountStr);
    if (amount <= 0) return;

    const isRefund = sign === "−" || sign === "-";
    const monthNum = MONTHS[monthAbbr];

    let middle = middleRaw.replace(CARD_MASK_RE, "").trim();

    const parcelaMatch = middle.match(PARCELA_RE);
    const parcela = parcelaMatch ? parcelaMatch[1] : null;
    if (parcelaMatch) {
      middle = middle.replace(PARCELA_RE, "").trim();
    }

    const context = parcela
      ? `parcela ${parcela}, compra orig. ${day}/${monthNum}`
      : `compra em ${day}/${monthNum}`;
    const description = `${CARD_LABEL} - ${middle} (${context})`;

    rows.push({
      date: paymentDate,
      description,
      amount,
      type: isRefund ? "income" : "expense",
      category: guessCategory(middle),
      selected: true,
    });
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Single-line transaction: date, description and amount all together.
    const single = line.match(TX_RE);
    if (single) {
      const [, day, monthAbbr, middleRaw, sign, amountStr] = single;
      pushRow(day, monthAbbr, middleRaw, sign, amountStr);
      continue;
    }

    // Multi-line entry: a date line whose amount is on a following line, with
    // optional explanation lines in between (e.g. detailed refunds). Look ahead
    // for the first standalone amount, stopping if another entry starts first.
    const dateLine = line.match(DATE_LINE_RE);
    if (dateLine) {
      const [, day, monthAbbr, middleRaw] = dateLine;
      for (let j = i + 1; j < lines.length && j <= i + 5; j++) {
        const amountOnly = lines[j].match(AMOUNT_ONLY_RE);
        if (amountOnly) {
          pushRow(day, monthAbbr, middleRaw, amountOnly[1], amountOnly[2]);
          i = j;
          break;
        }
        if (TX_RE.test(lines[j]) || DATE_LINE_RE.test(lines[j])) break;
      }
    }
  }

  return rows;
}
