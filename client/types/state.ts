import { Storage } from "./storage";
import { Play } from "./play";
export interface State {
  data: any;
  listeners: ((arg0: any) => any)[];
  storageKey: string;
  storage: Storage;
  apiUrl: string

  init();

  setState: (state: { data: {} }) => void;
  getState: () => { data: {} };
  subscribe: (arg0: (data: {}) => any) => any;

  move: (move: Play) => any;
  whoWins(computer: Play, player: Play);
  // getComputerScore(): number;
  getPlayerScore(): number;
  getComputerScore(): number;
  getComputerMove(): Play;
  resetResults();
  getLastResult(): number;

  createNewGame(data: { name: string })
  joinNewGame(data: { name: string, code: string });
  makeMoveToGame(move)
  startGame()
  getUserName(): string;
}
