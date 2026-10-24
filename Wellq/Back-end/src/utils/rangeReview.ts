/**
 * Local document arithmetic only.
 * No clinical catalogue, diagnosis or external AI.
 * Strict conformance with WellQ synthetic evaluation range review logic.
 */

export interface IMeasurement {
  name: string;
  value: string | number;
  unit: string;
  reference: string | null;
  comparison: 'within' | 'below' | 'above' | 'no_reference' | 'unit_mismatch' | 'invalid_reference';
  page: number;
  source: string;
}

export interface IRangeReviewResult {
  version: string;
  outcome: 'read' | 'no_measurements' | 'no_text' | 'limit' | 'unsupported' | 'unreadable';
  measurements: IMeasurement[];
  pages_read: number;
  diagnosis: null;
  requires_professional_review: boolean;
}

const NUMBER_PATTERN = '-?\\d+(?:[.,]\\d+)?';
const VALUE_REGEX = new RegExp(`^(${NUMBER_PATTERN})\\s+([^|]+)$`);
const REFERENCE_REGEX = new RegExp(`(?:Referencia|Reference):\\s*(${NUMBER_PATTERN})\\s*(?:–|−|-|a|to)\\s*(${NUMBER_PATTERN})\\s+([^|]+)`, 'i');

export const RANGE_VERSION = 'document-ranges-v1';

/**
 * Parses pipe-delimited measurement text lines.
 * Format: "Nombre de medición | valor unidad | Referencia: min-max unidad"
 */
export function parseRangeText(text: string, pageNumber: number = 1): IMeasurement[] {
  const measurements: IMeasurement[] = [];
  const lines = text.split(/\r?\n/);

  for (const line of lines) {
    const parts = line.split('|').map((s) => s.trim());
    if (parts.length !== 2 && parts.length !== 3) continue;
    if (parts[0].length < 1 || parts[0].length > 100) continue;

    const valueMatch = parts[1].match(VALUE_REGEX);
    if (!valueMatch) continue;

    const [, numStr, unit] = valueMatch;
    if (unit.trim().length > 30) continue;

    const item: IMeasurement = {
      name: parts[0],
      value: numStr.trim(),
      unit: unit.trim(),
      page: pageNumber,
      source: line.slice(0, 300),
      comparison: 'no_reference',
      reference: null,
    };

    if (parts.length === 3) {
      const refMatch = parts[2].match(REFERENCE_REGEX);
      if (refMatch) {
        const [, lowStr, highStr, refUnit] = refMatch;
        const lo = parseFloat(lowStr.replace(',', '.'));
        const hi = parseFloat(highStr.replace(',', '.'));
        const val = parseFloat(numStr.replace(',', '.'));

        item.reference = parts[2];
        if (unit.trim().toLowerCase() !== refUnit.trim().toLowerCase()) {
          item.comparison = 'unit_mismatch';
        } else if (lo > hi) {
          item.comparison = 'invalid_reference';
        } else if (val < lo) {
          item.comparison = 'below';
        } else if (val > hi) {
          item.comparison = 'above';
        } else {
          item.comparison = 'within';
        }
      }
    }

    measurements.push(item);
    if (measurements.length >= 100) break;
  }

  return measurements;
}

/**
 * Default synthetic measurements for testing kinesiology and clinical exams
 */
export const SYNTHETIC_FIXTURE_MEASUREMENTS: IMeasurement[] = [
  {
    name: 'Movilidad de prueba A',
    value: 110,
    unit: 'grados',
    reference: 'Referencia: 100-150 grados',
    comparison: 'within',
    page: 1,
    source: 'Movilidad de prueba A | 110 grados | Referencia: 100-150 grados',
  },
  {
    name: 'Fuerza de prueba B',
    value: 8,
    unit: 'unidad_demo',
    reference: 'Referencia: 10-20 unidad_demo',
    comparison: 'below',
    page: 1,
    source: 'Fuerza de prueba B | 8 unidad_demo | Referencia: 10-20 unidad_demo',
  },
  {
    name: 'Medicion de prueba C',
    value: 25,
    unit: 'unidad_demo',
    reference: 'Referencia: 10-20 unidad_demo',
    comparison: 'above',
    page: 1,
    source: 'Medicion de prueba C | 25 unidad_demo | Referencia: 10-20 unidad_demo',
  },
  {
    name: 'Dolor informado de prueba',
    value: 3,
    unit: 'puntos',
    reference: null,
    comparison: 'no_reference',
    page: 1,
    source: 'Dolor informado de prueba | 3 puntos',
  },
];
