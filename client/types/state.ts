import { Storage } from "./storage";
import { Play } from "./play";
export interface State {
  data: {
    game: {
      computer: Play[];
      player: Play[];
      results: number[];
    };
  };
  listeners: ((arg0: any) => any)[];
  storage: Storage;

  init();

  setState: (state: { data: {} }) => void;
  getState: () => { data: {} };
  subscribe: (arg0: (data: {}) => any) => any;

  move: (move: Play) => any;
  matchResult(result: number[]);
  whoWins(computer: Play, player: Play);
  getComputerScore(): number;
  getPlayerScore(): number;
  getComputerMove(): Play;
  resetResults();
  getLastResult(): number;
}
