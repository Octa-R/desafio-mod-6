import { Storage } from "./storage";
import { Play } from "./play";
import { GameData } from "./gameData";
export interface State {
  data: GameData
  listeners: ((arg0: any) => any)[];
  storageKey: string;
  storage: Storage;
  apiUrl: string

  init();

  setState: (data: GameData) => void;
  getState: () => GameData;
  subscribe: (arg0: (data: {}) => any) => any;

  move: (move: Play) => any;
  whoWins(computer: Play, player: Play);
  // getComputerScore(): number;
  getPlayerScore(): number;
  getComputerScore(): number;
  getComputerMove(): Play;
  resetResults();
  getLastResult(): number;

  createNewGame()
  joinGame(data: { name: string, code: string });
  makeMoveToGame(move)
  getUserName(): string;
  getRoomId(): string;
  isOpponentOnline(): boolean;
  opponentPressedStart(): boolean;
  startGame(): void
}