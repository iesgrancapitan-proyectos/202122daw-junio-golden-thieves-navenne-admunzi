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

    // when a player use stun ability, the player is stunned
    socket.on("stun player", function (id) {
      // emit the stun to the player
      io.to(id).emit('i am stunned', null , function(data) {});
    });

    // when a player use break tool ability
    socket.on("breakTool player", function (id) {
      // emit break tool to the player
      io.to(id).emit('broken tool', null , function(data) {});
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
