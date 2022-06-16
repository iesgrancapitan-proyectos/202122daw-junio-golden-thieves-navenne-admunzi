export function gameCommunication(socket, roomInfo) {
  //when the scene is ready
  socket.on("ready", () => {
    socket.emit("greeting", roomInfo.players);
    socket.to(roomInfo.roomKey).emit("new player", socket.id, roomInfo.players[socket.id]);
  });

  // when a player moves, update the player data
  socket.on("player movement", function (data) {
    if (roomInfo.players[socket.id] && data) {
      roomInfo.players[socket.id].x = data.x;
      roomInfo.players[socket.id].y = data.y;
      roomInfo.players[socket.id].keydown = data.keydown;
      // emit a message to all players about the player that moved
      socket.to(roomInfo.roomKey).emit("player moved", roomInfo.players[socket.id]);
    }
  });

  // when a player mines, play animation
  socket.on("player mining", function () {
    socket.to(roomInfo.roomKey).emit("player mined", roomInfo.players[socket.id]);
  });

  // when a player stops mining, stop animation
  socket.on("player stop mining", function () {
    socket.to(roomInfo.roomKey).emit("player mine stopped", roomInfo.players[socket.id]);
  });

  socket.on("disable ore", function (ore) {
    socket.to(roomInfo.roomKey).emit("delete ore", ore)
  })
}