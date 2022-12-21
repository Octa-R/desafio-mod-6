import { customAlphabet } from "nanoid";
import { rtdb, firestore } from "../db";
import * as admin from "firebase-admin";
//--------------------------------------------------------------------------------------------
const roomsCollection = firestore.collection("rooms");
const shortId = customAlphabet("0123456789ABCDEF", 6);
const longId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  16
);
//--------------------------------------------------------------------------------------------
async function userExists(roomId, userName, userId): Promise<boolean> {
  const roomDoc = await roomsCollection.doc(roomId).get();
  const roomData = roomDoc.data();
  const { player1, player2 } = roomData;
  const userArray = [player1, player2];
  const userExists = userArray.find(user => {
    return user.name === userName && user.id === userId
  })
  return userExists
}

async function roomExists(roomId): Promise<boolean> {
  const roomDoc = await roomsCollection.doc(roomId).get();
  return roomDoc.exists
}

function getWinner(player1, player2): "empate" | string {
  const { choice: player1Choice } = player1;
  const { choice: player2Choice } = player2;

  if (player1Choice === player2Choice) {
    return "empate";
  }
  if (player1Choice === "piedra") {
    return player2Choice === "tijeras" ? player1.name : player2.name;
  }
  if (player1Choice === "papel") {
    return player2Choice === "piedra" ? player1.name : player2.name;
  }
  if (player1Choice === "tijeras") {
    return player2Choice === "papel" ? player1.name : player2.name;
  }
}

function checkMoves(rtdbRoomId: string, roomId: string) {
  const roomRef = rtdb.ref(`/rooms/${rtdbRoomId}/${roomId}`)
  roomRef.once("value", (snapshot) => {
    console.log("se ejecuto la lectura de la rtdb en checkMoves")
    if (!snapshot.exists) {
      return
    }

    const data = snapshot.val();
    const player1Name = Object.keys(data)[0]
    const player2Name = Object.keys(data)[1]
    const player1 = data[player1Name]
    const player2 = data[player2Name]
    if (player1.choice && player2.choice) {
      // ambos jugadores hicieron su jugada
      const winner = getWinner(player1, player2);
      const loser = winner === player1.name ? player2.name : player1.name;

      console.log("winner: ", winner)

      const roomNewState = {
        [player1Name]: {
          ...player1
        },
        [player2Name]: {
          ...player2,
        }
      }
      roomNewState[player1Name].choice = ""
      roomNewState[player2Name].choice = ""

      if (winner === "empate") {
        roomNewState[player1Name].result = "empate"
        roomNewState[player2Name].result = "empate"
      } else if (winner !== "empate") {
        roomNewState[winner].result = "winner"
        roomNewState[winner].score = roomNewState[winner].score + 1
        roomNewState[loser].result = "loser"
      }
      rtdb.ref(`/rooms/${rtdbRoomId}/${roomId}`).set(roomNewState)
    }
  })
  return roomRef
}
//--------------------------------------------------------------------------------------------
const createRoom = (req, res) => {
  const userName: string = req.query.userName.toString()
  const rtdbRoomId = longId();
  const roomId = shortId();
  const userId = longId();

  if (!userName) {
    res
      .status(400)
      .json({
        ok: false,
        message: "el nombre de usuario es requerido"
      })
    return
  }

  const firebaseRoom = {
    player1: {
      name: userName,
      id: userId,
    },
    rtdbRoomId: rtdbRoomId,
    ts: Date.now()
  }

  const createFirebaseRoom = roomsCollection
    .doc(roomId)
    .set(firebaseRoom);

  const gameState = {
    online: true,
    start: false,
    name: userName,
    score: 0,
    choice: "",
  }
  const gameStateRef = rtdb.ref(`/rooms/${rtdbRoomId}/${roomId}/${userName}`)
  const createGameState = gameStateRef.set(gameState)

  Promise.all([createFirebaseRoom, createGameState])
    .then(() => {
      res.json({
        userId: userId,
        rtdbRoomId: rtdbRoomId,
        roomId: roomId,
      });
    })
    .catch(() => {
      res.json({ ok: false });
    });
}

const joinRoom = async (req, res) => {
  const userName: string = req.query.userName.toString();
  const roomId = req.params.roomId.toString();

  if (!userName || !roomId) {
    res
      .status(400)
      .json({
        ok: false,
        message: "faltan datos para unirse a la room"
      });
  }

  const room: boolean = await roomExists(roomId)
  if (!room) {
    res.status(400).json({
      ok: false,
      message: "no existe la room"
    });
    return;
  }

  const roomDoc = await roomsCollection.doc(roomId.toString()).get();
  const roomData = roomDoc.data();
  const { player2 } = roomData;
  if (player2) {
    res.status(400).json({
      ok: false,
      message: "la room ya esta llena"
    });
    return;
  }

  const playerTwoGameState = {
    online: true,
    start: false,
    name: userName,
    score: 0,
    choice: "",
  }
  const data = roomDoc.data();
  const { rtdbRoomId } = data;
  const userId = longId();
  const updates = {}
  updates[`/rooms/${rtdbRoomId}/${roomId}/${userName}`] = playerTwoGameState
  try {
    await rtdb.ref().update(updates)
  } catch (e) {
    res.status(400).json({ ok: false, message: "error al unirse a la room" });
    return;
  }
  //add player 2 to firestore
  roomsCollection
    .doc(roomId)
    .update({
      player2: {
        name: userName,
        id: userId
      }
    });

  res.json({
    ok: true,
    userId: userId,
    rtdbRoomId: data.rtdbRoomId,
    opponentName: data.player1.name,
    roomId: roomId,
  });
}
//-----------------------------------------------------------------
const startGame = async (req, res) => {
  const { userName, rtdbRoomId, userId } = req.body;
  const roomId = req.params.roomId.toString();

  const room: boolean = await roomExists(roomId)
  if (!room) {
    res
      .status(400)
      .json({
        ok: false,
        message: "no existe la room"
      });
    return;
  }
  const user = await userExists(roomId, userName, userId)
  if (!user) {
    res
      .status(400)
      .json({
        ok: false,
        message: "no eres el jugador de esta room"
      });
    return;
  }

  const updates = {}
  updates[`/rooms/${rtdbRoomId}/${roomId}/${userName}/start`] = true
  // updates[`/rooms/${rtdbRoomId}/${roomId}/state`] = "playing"

  try {
    await rtdb.ref().update(updates)
    res.json({
      ok: true,
      message: "partida iniciada"
    });
  } catch (e) {
    res
      .status(400)
      .json({
        ok: false,
        message: "error al iniciar la partida"
      });
  }
}

const makeMove = async (req, res) => {
  const { userId, move, rtdbRoomId, userName } = req.body;
  const roomId = req.params.roomId.toString();
  if (!userId || !move || !rtdbRoomId || !roomId || !userName) {
    res
      .status(400)
      .json({
        ok: false,
        message: "faltan datos para jugar"
      });
    return;
  }
  const room: boolean = await roomExists(roomId)
  if (!room) {
    res
      .status(400)
      .json({
        ok: false,
        message: "no existe la room"
      });
    return;
  }
  const user = await userExists(roomId, userName, userId)
  if (!user) {
    res
      .status(400)
      .json({
        ok: false,
        message: "no eres el jugador de esta room"
      });
    return;
  }
  const updates = {
    [`/rooms/${rtdbRoomId}/${roomId}/${userName}/choice`]: move,
    [`/rooms/${rtdbRoomId}/${roomId}/${userName}/start`]: false
  }
  try {
    await rtdb.ref().update(updates)
    checkMoves(rtdbRoomId, roomId)
    res
      .json({
        ok: true,
        message: "movimiento realizado"
      });
  } catch (error) {
    res
      .status(400)
      .json({ ok: false, error })
  }
}


export { createRoom, joinRoom, startGame, makeMove }