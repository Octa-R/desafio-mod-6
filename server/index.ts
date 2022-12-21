import * as express from "express";
import helmet from "helmet";
import * as dotenv from "dotenv";
dotenv.config();
const port = process.env.PORT || 3000;
const app = express();
//--------------
import { createRoom, joinRoom, startGame, makeMove } from "./controllers";
const rooms = express.Router();
//-----------
app.use(express.static("public"));
app.use(express.json());
app.use(rooms);
app.use(helmet());
//-------------
rooms.post("/", createRoom);
rooms.post("/:roomId", joinRoom);
rooms.patch("/:roomId", startGame);
rooms.post("/:roomId/move", makeMove);
//-------------
app.listen(port, () => {
  console.log(`app en  http://localhost:${port}`);
});
