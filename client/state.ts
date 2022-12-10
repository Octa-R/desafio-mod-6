import { Storage } from "./types/storage";
import { ref, onValue, get, set, child } from "firebase/database";
import { rtdb } from "./rtdb";
import { State } from "./types/state";
import { Play } from "./types/play";
import { Router } from "@vaadin/router";
import { GameData } from "./types/gameData";
const moveList: Play[] = ["tijeras", "papel", "piedra"];
export const state = {
  data: {
    roomId: "",
    rtdbRoomId: "",
    results: [],
    userId: "",
    userName: "",
    playerScore: [],
    playerPressedStart: false,
    playerChoice: "",
    opponentName: "",
    opponentScore: [],
    opponentIsOnline: false,
    opponentPressedStart: false,
    opponentChoice: "",
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
    console.log("set state", data);

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
    //devuelve una funcion que si la ejecutamos hace unsubscribe
    return () => {
      this.listeners = this.listeners.filter(e => e != callback)
    }
  },
  async move(playerChoice: Play) {
    const cs = this.getState();
    const body = {
      rtdbRoomId: cs.rtdbRoomId,
      userId: cs.userId,
      userName: cs.userName,
      move: playerChoice,
    }
    cs.playerChoice = playerChoice;
    this.setState(cs);

    const res = await fetch(`${this.apiUrl}/${cs.roomId}/move`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    await res.json();
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
    cs.userId = json.userId;
    cs.rtdbRoomId = json.rtdbRoomId;
    cs.opponentName = json.opponentName;
    cs.opponentIsOnline = true;//asumo que esta online por simplicidad
    this.setState(cs)
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
      const cs: GameData = this.getState()

      if (Object.entries(data).length === 2) {
        for (const key in data) {
          if (key !== cs.userName) {
            cs.opponentName = key;
            cs.opponentIsOnline = true;
            cs.opponentPressedStart = false;
            this.setState(cs)
            unsubscribe()
          }
        }
      }
    })
  },
  makeMoveToGame(move) { },
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
  },
  opponentPressedStart() {
    const cs = this.getState()
    if (cs.opponentPressedStart) {
      return true
    }
    return false;
  },
  async startGame() {
    const cs: GameData = this.getState()

    const body = { userName: cs.userName, rtdbRoomId: cs.rtdbRoomId }
    const res = await fetch(`${this.apiUrl}/${cs.roomId}`, {
      method: "PATCH",
      mode: 'cors',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })
    const json = await res.json()

    if (!json.ok) {
      console.error(json.message)
      return
    }
    cs.playerPressedStart = true;
    this.setState(cs)

    const opponentPressedStart = ref(rtdb, `/rooms/${cs.rtdbRoomId}/${cs.roomId}/${cs.opponentName}/start`);
    const snapshot = await get(opponentPressedStart)
    if (snapshot.exists()) {
      const start = snapshot.val()
      if (start == true) {
        const cs: GameData = this.getState()
        cs.opponentPressedStart = true;
        this.setState(cs)
        return
      }
    }

    onValue(opponentPressedStart, (snapshot) => {
      if (snapshot.exists()) {
        const cs: GameData = this.getState()
        cs.opponentPressedStart = snapshot.val();
        this.setState(cs)
      }
    })
  },
  async getopponentChoice() {
    const cs = this.getState()
    const opponentChoice = ref(rtdb, `/rooms/${cs.rtdbRoomId}/${cs.roomId}/${cs.opponentName}/move`);
    const snapshot = await get(opponentChoice)
    if (snapshot.exists()) {
      const move = snapshot.val()
      if (move) {
        return move
      }
    }
    return null
  },
  async waitForopponentChoice() {
    const cs = this.getState()
    const opponentChoice = ref(rtdb, `/rooms/${cs.rtdbRoomId}/${cs.roomId}/${cs.opponentName}/move`);
    onValue(opponentChoice, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const cs = this.getState()
        cs.opponentChoice = data;
        this.setState(cs)
      }
    })
  },
  async getGameResults() {
    const move = await this.getopponentChoice()
    if (move != null) {
      const cs = this.getState()
      cs.opponentChoice = move;
      this.setState(cs)
      return
    }
    this.waitForopponentChoice()
  },
};
