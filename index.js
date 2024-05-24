// const app = require("express")();
// const server = require("http").createServer(app);
// const cors = require("cors");

// const io = require("socket.io")(server, {
//   cors: {
//     origin: "*", //habilitar todos los origenes
//     methods: ["GET", "POST"],
//   },
// });

// app.use(cors());

// const PORT = process.env.PORT || 5000;

// app.get("/", (req, res) => {
//   res.send("Running");
// });

// io.on("connection", (socket) => {
//   //los sokets son usados para transmitir datos en tiempo real
//   socket.emit("me", socket.id);

//   socket.on("disconnect", () => {
//     socket.broadcast.emit("callEnded");
//   });

//   socket.on("callUser", ({ userToCall, signalData, from, name }) => {
//     io.to(userToCall).emit("callUser", { signal: signalData, from, name });
//   });

//   socket.on("answerCall", (data) => {
//     io.to(data.to).emit("callAccepted", data.signal);
//   });
// });

// server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));

const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
  cors: {
    origin: "*", //habilitar todos los origenes
    methods: ["GET", "POST"],
  },
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Running");
});

const calls = {};

io.on("connection", (socket) => {
  socket.emit("me", socket.id);

  socket.on("disconnect", () => {
    for (const id in calls) {
      if (calls[id].userToCall === socket.id || calls[id].from === socket.id) {
        io.to(id).emit("callEnded");
        delete calls[id];
      }
    }
  });

  socket.on("callUser", ({ userToCall, signalData, from, name }) => {
    calls[socket.id] = { userToCall, signalData, from, name };
    io.to(userToCall).emit("callUser", { signal: signalData, from, name });
  });

  socket.on("answerCall", (data) => {
    calls[data.to].userVideo = socket.id;
    io.to(data.to).emit("callAccepted", { signal: data.signal, from: data.from });
  });
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
