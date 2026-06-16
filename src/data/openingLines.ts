export interface OpeningLine {
  id: string;
  name: string;
  eco: string;
  group?: string;
  orientation?: 'white' | 'black';
  moves: { san: string; hint: string | null }[];
}

export { default } from './openings/index';
