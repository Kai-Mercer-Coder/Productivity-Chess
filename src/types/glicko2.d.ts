declare module "glicko2" {
  interface Glicko2Options {
    tau?: number;
    rating?: number;
    rd?: number;
    vol?: number;
  }

  interface Player {
    getRating(): number;
    setRating(rating: number): void;
    getRd(): number;
    setRd(rd: number): void;
    getVol(): number;
    setVol(vol: number): void;
    addResult(opponent: Player, outcome: number): void;
    update_rank(): void;
    hasPlayed(): boolean;
  }

  type MatchTuple = [Player, Player, number];

  class Glicko2 {
    constructor(options?: Glicko2Options);
    makePlayer(rating?: number, rd?: number, vol?: number, id?: string): Player;
    updateRatings(matches: MatchTuple[]): void;
    predict(player: Player, opponent: Player): number;
    addMatch(player: Player, opponent: Player, outcome: number): void;
    makeRace(results: Player[][]): { matches: MatchTuple[] };
    removePlayers(): void;
    getPlayers(): Player[];
    cleanPreviousMatches(): void;
    calculatePlayersRatings(): void;
  }

  export { Glicko2, Player, MatchTuple, Glicko2Options };
}
