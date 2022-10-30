import { Storage } from "./types/storage";
import { State } from "./types/state";
import { Play } from "./types/play";
import { Router } from "@vaadin/router";
const moveList: Play[] = ["tijeras", "papel", "piedra"];
export const state: State = {
  data: {
    game: {
      player: [],
      computer: [],
      results: [],
    },
    roomId: "",
    rtdbRoomId: "",
    userId: "",
    userName: "",
    opponentName: "",
  },
  apiUrl: "",
  storageKey: "game-state",
  listeners: [],
  storage: new Storage(),
  init() {
    this.apiUrl = process.env.API_URL_BASE || "http://localhost:3000"
    Router.go(location.pathname);
    const { data } = this.storage.get(this.storageKey);
    const newState = { ...this.data.game, ...data };
    this.setState(newState);
  },
  setState(data) {
    this.data = data;
    this.storage.save(this.storageKey, data);
    for (const cb of this.listeners) {
      cb(this.getState());
    }
  },
  getState() {
    const data = this.storage.get(this.storageKey);
    return data;
  },
  subscribe(callback) {
    this.listeners.push(callback);
  },
  move(playerPlay: Play) {
    //la jugada del jugador
    const game = this.getState();
    game.player.push(playerPlay);
    //jugada de la maquina
    const computerPlay: Play = this.getComputerMove();
    game.computer.push(computerPlay);
    const result = this.whoWins(computerPlay, playerPlay);
    game.results.push(result);
    this.setState(game);
  },
  getComputerMove() {
    const randNumber: number = Math.floor(Math.random() * 3);
    const computerPlay: Play = moveList[randNumber];
    return computerPlay;
  },
  whoWins(computer: Play, player: Play) {
    // -1 gana pc
    // 0 empate
    // 1 gana player
    // si son iguales -> 0
    // si pc es tijera ->
    //    si player papel -> player pierde
    //    si player piedra -> player gana

    if (computer === player) {
      return 0;
    } else {
      if (computer === "tijeras") {
        return player === "papel" ? -1 : 1;
      }
      if (computer === "papel") {
        return player === "piedra" ? -1 : 1;
      }
      if (computer === "piedra") {
        return player === "tijeras" ? -1 : 1;
      }
    }
  },
  getPlayerScore() {
    const game = this.getState();
    return game.results.reduce((prev, act) => {
      return act > 0 ? prev + 1 : prev;
    }, 0);
  },
  getComputerScore() {
    const game = this.getState();
    return game.results.reduce((prev, act) => {
      return act < 0 ? prev + 1 : prev;
    }, 0);
  },
  getLastResult() {
    const game = this.getState();
    return game.results.at(-1);
  },
  resetResults() {
    this.setState({
      player: [],
      computer: [],
      results: [],
    });
  },
  async joinNewGame(data) {
    if (data.name === "" || data.code === "") {
      console.error("faltan datos para unirse a la partida")
      return
    }
    const res = await fetch(`${this.apiUrl}/${data.code}?userName=${data.name}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      }
    })

  },
  async createNewGame(data) {
    const res = await fetch(`${this.apiUrl}/?userName=${data.name}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      }
    })
    const { rtdbRoomId, userId, roomId } = await res.json()
    const cs = this.getState()
    cs.rtdbRoomId = rtdbRoomId
    cs.userId = userId
    cs.roomId = roomId
    cs.userName = data.name
    this.setState(cs)
  },
  makeMoveToGame(move) { },
  startGame() { },
  getUserName() {
    return this.data.userName;
  }
};
