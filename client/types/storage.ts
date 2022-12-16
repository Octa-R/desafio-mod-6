import { GameData } from "./gameData";

export class Storage {
  save(key: string, data: GameData) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  get(key): { data: any } {
    const data = localStorage.getItem(key) || null;
    if (data !== null) {
      return JSON.parse(data);
    }
    return { data: {} };
  }
}
