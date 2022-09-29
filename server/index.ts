import * as express from "express";
const port = process.env.PORT || 3000;
const app = express();
app.get("/", (req, res) => {
  res.send("hola");
});

app.listen(port, () => {
  console.log(`app en puerto ${port}`);
});
