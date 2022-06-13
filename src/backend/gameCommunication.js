export function gameCommunication(socket, currentPlayers) {
  //when the scene is ready
  socket.on("ready", () => {
    // create a new player and add it to currentPlayers
    let newPlayer = createNewPlayer(currentPlayers, socket);
    socket.emit("greeting", currentPlayers);
    socket.broadcast.emit("new player", socket.id, newPlayer);
  });

  // when a player moves, update the player data
  socket.on("player movement", function (data) {
    if (currentPlayers[socket.id] && data) {
      currentPlayers[socket.id].x = data.x;
      currentPlayers[socket.id].y = data.y;
      currentPlayers[socket.id].keydown = data.keydown;
      // emit a message to all players about the player that moved
      socket.broadcast.emit("player moved", currentPlayers[socket.id]);
    }
  });

  // when a player mines, play animation
  socket.on("player mining", function () {
    socket.broadcast.emit("player mined", currentPlayers[socket.id]);
  });

  // when a player stops mining, stop animation
  socket.on("player stop mining", function () {
    socket.broadcast.emit("player mine stopped", currentPlayers[socket.id]);
  });
}