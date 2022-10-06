import * as express from "express";
import helmet from "helmet";
import { customAlphabet } from "nanoid";
import { rtdb, firestore } from "./db";

//--------------
const roomsCollection = firestore.collection("rooms");
const shortId = customAlphabet("0123456789ABCDEF", 4);
const longId = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  16
);
const port = process.env.PORT || 3000;
const app = express();
//--------------
const rooms = express.Router();
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
//-----------
app.use(rooms);
app.use(helmet());
app.use(express.json());
app.use(express.static("public"));
//-------------

app.listen(port, () => {
  console.log(`app en  http://localhost:${port}`);
});
