import { Storage } from "./types/storage";
import { ref, onValue, off } from "firebase/database";
import { rtdb } from "./rtdb";
import { State } from "./types/state";
import { Play } from "./types/play";
import { Router } from "@vaadin/router";
import { GameData } from "./types/gameData";
const moveList: Play[] = ["tijeras", "papel", "piedra"];
export const state: State = {
  data: {
    roomId: "",
    rtdbRoomId: "",
    results: [],
    userId: "",
    userName: "",
    playerScore: [],
    opponentName: "",
    opponentScore: [],
    opponentIsOnline: false,
    opponentPressedStart: false
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
  setState(data: GameData) {
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
    return () => {
      this.listeners = this.listeners.filter(e => e != callback)
    }
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
  async joinGame(data) {
    if (!data.name || !data.code) {
      console.error("faltan datos para unirse a la partida")
      return
    }
    console.log("data que viene en joingame", data)
    const res = await fetch(`${this.apiUrl}/${data.code}?userName=${data.name}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      }
    })
    const json = await res.json()
    if (json.ok != true) {
      console.error(json.message)
      return
    }
    const cs = this.getState()
    cs.roomId = data.code;
    cs.userName = data.name
    cs.rtdbRoomId = json.rtdbRoomId;
    cs.opponentName = json.opponentName;
    this.setState(cs)
  },
  listenRoom() {
    const cs = this.getState();
    const gameData = ref(rtdb, `/rooms/${cs.rtdbRoomId}/${cs.roomId}`);
    onValue(gameData, snapShot => {
      const data = snapShot.val()
      console.log(data)
    })
  },
  async createNewGame() {
    const cs = this.getState()
    const res = await fetch(`${this.apiUrl}/?userName=${cs.userName}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      }
    })
    const { rtdbRoomId, userId, roomId } = await res.json()

    cs.rtdbRoomId = rtdbRoomId
    cs.userId = userId
    cs.roomId = roomId
    this.setState(cs)

    const gameData = ref(rtdb, `/rooms/${cs.rtdbRoomId}/${cs.roomId}`);
    const unsubscribe = onValue(gameData, (snapShot) => {
      const data = snapShot.val()
      console.log("dentro de createNewGame", data)
      // console.log(Object.keys(data))
      const cs: GameData = this.getState()

      if (Object.entries(data).length === 2) {
        for (const key in data) {
          if (key !== cs.userName) {
            console.log(key)
            cs.opponentName = key;
            cs.opponentIsOnline = true;
            cs.opponentPressedStart = false;
            this.setState(cs)
            console.log("se conecto el jugador " + this.data.opponentName)
            unsubscribe()
          }
        }
      }
    })
  },
  makeMoveToGame(move) { },
  start() {

  },
  getUserName() {
    return this.data.userName;
  },
  getRoomId() {
    return this.data.roomId;
  },
  isOpponentOnline() {
    const cs = this.getState()
    if (cs.opponentIsOnline) {
      return true
    }
    return false;
  }
};
