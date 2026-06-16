import { sicilianLines } from './sicilian';
import { caroKannLines } from './caro-kann';
import { qgdLines } from './qgd';
import { londonLines } from './london';
import { ruyLopezLines } from './ruy-lopez';
import type { OpeningLine } from '../openingLines';

const openingLines: OpeningLine[] = [
  ...sicilianLines,
  ...caroKannLines,
  ...qgdLines,
  ...londonLines,
  ...ruyLopezLines,
];

export default openingLines;
