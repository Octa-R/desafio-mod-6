import * as express from "express";
import helmet from "helmet";
import { customAlphabet } from "nanoid";
import { rtdb, firestore } from "./db";
//--------------
const roomsCollection = firestore.collection("rooms");
const shortId = customAlphabet("0123456789ABCDEF", 6);
const longId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  16
);
const port = process.env.PORT || 3000;
const app = express();
//--------------
const rooms = express.Router();
//-----------
app.use(express.static("public"));
app.use(express.json());
app.use(rooms);
app.use(helmet());
//-------------
rooms.post("/", (req, res) => {
  const userName: string = req.query.userName.toString()
  const rtdbRoomId = longId();
  const roomId = shortId();
  const userId = longId();

  const firebaseRoom = {
    player1: {
      name: userName,
      id: userId
    },
    rtdbRoomId: rtdbRoomId
  }

  const createFirebaseRoom = roomsCollection
    .doc(roomId)
    .set(firebaseRoom);

  const PlayerOneState = {
    choice: "",
    name: userName
  };
  const newPlayerRef = rtdb.ref(`/rooms/${rtdbRoomId}/${userId}`);
  const createRTDBRoom = newPlayerRef.set(PlayerOneState);

  const gameState = {
    [userName]: {
      online: true,
      start: false
    }
  }
  const gameStateRef = rtdb.ref(`/rooms/${rtdbRoomId}/${roomId}`)
  const createGameState = gameStateRef.set(gameState)

  Promise.all([createFirebaseRoom, createRTDBRoom, createGameState])
    .then((response) => {
      res.json({
        userId: userId,
        rtdbRoomId: rtdbRoomId,
        roomId: roomId,
      });
    })
    .catch((err) => {
      res.json({ ok: false });
    });
});

rooms.post("/:roomId", async (req, res) => {
  const userName: string = req.query.userName.toString();
  const { roomId } = req.params;
  if (!userName || !roomId) {
    res
      .status(400)
      .json({ ok: false, message: "faltan datos para unirse a la room" });
  }
  const roomDoc = await roomsCollection.doc(roomId.toString()).get();
  if (!roomDoc.exists) {
    res
      .status(400)
      .json({ ok: false, message: "no existe la room" });
  }

  const playerTwoState = {
    choice: "",
    name: userName.toString()
  };
  const playerTwoGameState = {
    online: true,
    start: false
  }
  const data = roomDoc.data();
  const { rtdbRoomId } = data;
  const userId = longId();
  const updates = {}
  updates[`/rooms/${rtdbRoomId}/${userId}`] = playerTwoState
  updates[`/rooms/${rtdbRoomId}/${roomId}/${userName}`] = playerTwoGameState
  try {

    await rtdb.ref().update(updates)
  } catch (e) {
    console.log(e)
  }


  // TODO falta agregar al jugador 2 a la db
  //  //join firebase room
  //   const firebaseRoom = {
  //     player2:{
  //       name:userName,
  //       id:userId
  //     }
  //   }
  //   const createFirebaseRoom = roomsCollection
  //     .doc(roomId).

  //     .push(firebaseRoom);

  res.json({
    ok: true,
    rtdbRoomId: data.rtdbRoomId,
    opponentName: data.player1.name,
    roomId: roomId,
    owner: false,
  });
});

rooms.patch("/:roomId", async (req, res) => {
  console.log("se eecuto patch")
  const { userName, rtdbRoomId } = req.body;
  const { roomId } = req.params;
  console.log(req.body)
  console.log(roomId)
  const roomDoc = await roomsCollection.doc(roomId.toString()).get();
  // TODO falta chequear que el jugador exista
  if (roomDoc.exists) {
    const roomRef = rtdb.ref(`/rooms/${rtdbRoomId}/${roomId}/${userName}/start`);
    roomRef.set(true);
    res.json({ ok: true });
  } else {
    res.status(400)
      .json({ ok: false, message: "no existe la room" });
  }
});

rooms.post("/:roomId/play", async (req, res) => {
  const { userId, move, rtdbRoomId, userName } = req.body;
  const { roomId } = req.params;
  if (!userId || !move || !rtdbRoomId || !roomId) {
    res
      .status(400)
      .json({ ok: false, message: "faltan datos para jugar en la room" });
  }
  // TODO chequear que el jugador exista
  const roomDoc = await roomsCollection.doc(roomId.toString()).get();
  if (roomDoc.exists) {
    const updates = {};
    updates[`/rooms/${rtdbRoomId}/${userId}/choice`] = move
    updates[`/rooms/${rtdbRoomId}/${roomId}/${userName}/start`] = false
    try {
      await rtdb.ref().update(updates);
      res.json({ ok: true });
    } catch (error) {
      res
        .status(400)
        .json({ ok: false, error: error })
    }

  } else {
    res.json({ ok: false });
  }
});

rooms.post("/:roomId/start", (req, res) => {
  const { userId, move, rtdbRoomId, userName } = req.body;
  const { roomId } = req.params;
  if (!userId || !move || !rtdbRoomId || !roomId) {
    res
      .status(400)
      .json({ ok: false, message: "faltan datos" });
  }
})

app.listen(port, () => {
  console.log(`app en  http://localhost:${port}`);
});
