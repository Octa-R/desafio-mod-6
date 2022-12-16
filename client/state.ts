import { Storage } from "./types/storage";
import { ref, onValue, get } from "firebase/database";
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
    console.log("set state", data);
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
    console.log("al intentar unirse a la room", json)
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
      cs.playerPressedStart = true;
      console.log("se setea el estado en startGame", cs)
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
  async listenToRoom() {
    // leer si el oponente presiono start
    const pressedStart = await this.opponentPressedStartButton()
    if (!pressedStart) {
      // si no presiono quedarse escuchando que presione start
      this.listenOpponentStart()
    }
    this.listenOpponentChoice()
    this.listenGameScore()
    this.listenResults()
  },
  listenGameScore() {
    const cs = this.getState();
    const opponentScore = ref(rtdb, `/rooms/${cs.rtdbRoomId}/${cs.roomId}/${cs.opponentName}/score`);
    const playerScore = ref(rtdb, `/rooms/${cs.rtdbRoomId}/${cs.roomId}/${cs.userName}/score`);
    onValue(opponentScore, (snapShot) => {
      const data = snapShot.val()
      const cs = this.getState();
      cs.opponentScore = data;
      console.log("se setea el estado en listenGameScore", cs)
      this.setState(cs)
    })
    onValue(playerScore, (snapShot) => {
      const data = snapShot.val()
      const cs = this.getState();
      cs.playerScore = data;
      console.log("se setea el estado en listenGameScore", cs)
      this.setState(cs)
    }
    )
  },
  async opponentPressedStartButton() {
    const cs = this.getState()
    const opponentPressedStart = ref(rtdb, `/rooms/${cs.rtdbRoomId}/${cs.roomId}/${cs.opponentName}/start`);
    const snapshot = await get(opponentPressedStart)
    if (snapshot.exists()) {
      const start = snapshot.val()
      if (start === true) {
        // el oponente ya presiono start
        const cs = this.getState()
        cs.opponentPressedStart = true;
        console.log("se setea el estado en opponentPressedStartButton", cs)
        this.setState(cs)
        return true;
      }
    }
  },
  listenOpponentStart() {
    const cs = this.getState()
    const opponentPressedStart = ref(rtdb, `/rooms/${cs.rtdbRoomId}/${cs.roomId}/${cs.opponentName}/start`);
    onValue(opponentPressedStart, (snapshot) => {
      if (snapshot.exists()) {
        const start = snapshot.val()
        const cs: GameData = this.getState()
        cs.opponentPressedStart = start
        console.log("se setea el estado en listenOpponentStart", cs)
        this.setState(cs)
      }
    })
  },
  listenOpponentChoice() {
    const cs = this.getState()
    const opponentChoice = ref(rtdb, `/rooms/${cs.rtdbRoomId}/${cs.roomId}/${cs.opponentName}/choice`);
    onValue(opponentChoice, (snapshot) => {
      const data: Play = snapshot.val();
      if (data) {
        const cs = this.getState()
        cs.opponentChoice = data;
        console.log("se setea el estado en listenOpponentChoice", cs)
        this.setState(cs)
      }
    })
  },
  listenResults() {
    const cs = this.getState()
    const results = ref(rtdb, `/rooms/${cs.rtdbRoomId}/${cs.roomId}/${cs.userName}/result`);
    onValue(results, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        console.log("se actualiza el resultado:", data)
        const cs = this.getState()
        cs.result = data;
        console.log("se setea el estado en listenResults", cs)
        this.setState(cs)
      }
    })
  }
};
