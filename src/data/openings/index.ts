import { sicilianLines } from './sicilian';
import { caroKannLines } from './caro-kann';
import { qgdLines } from './qgd';
import { londonLines } from './london';
import { ruyLopezLines } from './ruy-lopez';
import { hyperDragonLines } from './hyper-dragon';
import { queensGambitLines } from './queens-gambit';
import { italianLines } from './italian';
import { defendNoobLines } from './defend-noob-attacks';
import type { OpeningLine } from '../openingLines';

const openingLines: OpeningLine[] = [
  ...sicilianLines,
  ...caroKannLines,
  ...qgdLines,
  ...londonLines,
  ...ruyLopezLines,
  ...hyperDragonLines,
  ...queensGambitLines,
  ...italianLines,
  ...defendNoobLines,
];

export default openingLines;
