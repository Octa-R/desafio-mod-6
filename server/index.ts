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
  const { userName } = req.query;
  const rtdbRoomId = longId();
  const roomId = shortId();
  const userId = longId();

  const createFirebaseRoom = roomsCollection
    .doc(roomId)
    .set({ owner: userName, ownerId: userId, rtdbRoomId: rtdbRoomId });

  const PlayerOneState = {
    choice: "",
    name: userName,
    online: true,
    start: false,
  };

  const newPlayerRef = rtdb.ref(`/rooms/${rtdbRoomId}/${userId}`);
  const createRTDBRoom = newPlayerRef.set(PlayerOneState);

  Promise.all([createFirebaseRoom, createRTDBRoom])
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
  const { userName } = req.query;
  const { roomId } = req.params;
  if (!userName || !roomId) {
    res.json({ ok: false });
  }
  const roomDoc = await roomsCollection.doc(roomId.toString()).get();
  if (roomDoc.exists) {
    const playerTwoState = {
      choice: "",
      name: userName,
      online: true,
      start: false,
    };
    const data = roomDoc.data();
    const { rtdbRoomId } = data;
    const userId = longId();
    const playerTwoRef = rtdb.ref(`/rooms/${rtdbRoomId}/${userId}`);
    playerTwoRef.set(playerTwoState);

    res.json({
      rtdbRoomId: data.rtdbRoomId,
      opponentName: data.owner,
      roomId: roomId,
      owner: false,
    });
  } else {
    res.json({ ok: false, message: "no existe la room" });
  }
});

rooms.patch("/:roomId", async (req, res) => {
  const { userId, rtdbRoomId } = req.body;
  const { roomId } = req.params;
  const roomDoc = await roomsCollection.doc(roomId.toString()).get();
  if (roomDoc.exists) {
    const roomRef = rtdb.ref(`/rooms/${rtdbRoomId}/${userId}/start`);
    roomRef.set(true);
    res.json({ ok: true });
  } else {
    res.json({ ok: false });
  }
});

rooms.post("/:roomId/play", async (req, res) => {
  const { userId, move, rtdbRoomId } = req.body;
  const { roomId } = req.params;
  if (!userId || !move || !rtdbRoomId || !roomId) {
    res.json({ ok: false });
  }
  const roomDoc = await roomsCollection.doc(roomId.toString()).get();
  if (roomDoc.exists) {
    rtdb.ref(`/rooms/${rtdbRoomId}/${userId}/choice`).set(move);
    rtdb.ref(`/rooms/${rtdbRoomId}/${userId}/start`).set(false);
    res.json({ ok: true });
  } else {
    res.json({ ok: false });
  }
});

app.listen(port, () => {
  console.log(`app en  http://localhost:${port}`);
});
