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

  resetResults();
  move: (move: Play) => any;
  getWinner(computer: Play, player: Play);
  createNewGame()
  joinGame(data: { name: string, code: string });
  makeMoveToGame(move)
  getUserName(): string;
  getRoomId(): string;
  isOpponentOnline(): boolean;
  opponentPressedStart(): boolean;
  startGame(): void
}