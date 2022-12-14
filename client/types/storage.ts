import { GameData } from "./gameData";

export class Storage {
  save(key: string, data: GameData) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  get(key): { data: any } {
    const data: string = localStorage.getItem(key) || "undefined";
    if (typeof data !== 'undefined') {
      return JSON.parse(data);
    }
    return { data: {} };
  }
}
