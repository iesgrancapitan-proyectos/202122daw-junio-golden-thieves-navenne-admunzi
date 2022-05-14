import { gameCommunication } from "./gameCommunication";

export function clientConnection(io) {
  let currentPlayers = {}; // to store player data

  // when a new player connects
  io.on("connection", function (socket) {
    gameCommunication(socket, currentPlayers);

    socket.on("disconnect", function () {
      // remove this player from currentPlayers
      delete currentPlayers[socket.id];
      // emit a message to all players to remove this player
      io.emit("remove player", socket.id);
    });
  });

  // every 10 seconds send a message with count of players
  setInterval(() => {
    const time = new Date();
    console.log(
      Object.keys(currentPlayers).length +
        " logged in @ " +
        time.toLocaleString("es-ES", {
          timeZone: "Europe/Madrid",
          hourCycle: "h23",
          hour: "numeric",
          minute: "numeric",
        })
    );
  }, 10000);
}
