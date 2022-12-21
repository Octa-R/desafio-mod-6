import { Storage } from "./types/storage";
import { ref, onValue } from "firebase/database";
import { rtdb } from "./rtdb";
import { Play } from "./types/play";
import { Router } from "@vaadin/router";
import { GameData } from "./types/gameData";
export const state = {
  data: {
    roomId: "",
    rtdbRoomId: "",
    result: "",
    userId: "",
    userName: "",
    playerScore: 0,
    playerPressedStart: false,
    playerChoice: "",
    opponentName: "",
    opponentScore: 0,
    opponentIsOnline: false,
    opponentPressedStart: false,
    opponentChoice: "",
    listening: false,
    playerIsWinner: "",
  },
  errorMessage: "",
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
      cb();
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
      this.listeners = this.listeners.filter(e => e !== callback)
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
  async joinGame(data) {
    if (!data.name || !data.code) {
      throw "Faltan datos"
    }
    const res = await fetch(`${this.apiUrl}/${data.code}?userName=${data.name}`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      }
    })

    const json = await res.json()
    if (json.ok != true) {
      throw json.message
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
    if (!cs.userName) {
      throw "falta ingresar usuario"
    }
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
  async startGame() {
    const cs = this.getState()
    if (!cs.listening) {
      cs.listening = true;
      this.setState(cs)
      this.listenToRoom()
    }

    const body = { userName: cs.userName, rtdbRoomId: cs.rtdbRoomId, userId: cs.userId }
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
  },
  listenToRoom() {
    const { rtdbRoomId, roomId } = this.getState();
    const room = ref(rtdb, `/rooms/${rtdbRoomId}/${roomId}`);
    onValue(room, (snapShot) => {
      const data = snapShot.val()
      const cs = this.getState();

      cs.opponentChoice = data[cs.opponentName].choice
      cs.opponentPressedStart = data[cs.opponentName].start
      cs.opponentScore = data[cs.opponentName].score

      cs.playerChoice = data[cs.userName].choice
      cs.playerPressedStart = data[cs.userName].start
      cs.playerScore = data[cs.userName].score

      cs.result = data[cs.userName].result

      console.log("se actualizara el estado", cs)
      this.setState(cs)
    })
  }
};
