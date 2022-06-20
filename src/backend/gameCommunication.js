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

  // when a player moves, update the range
  socket.on("player movement, range", function (data) {
    socket.to(roomInfo.roomKey).emit("player moved, range", roomInfo.players[socket.id]);
  });

  // when a player opens a vote
  socket.on("vote panels", function () {
    socket.to(roomInfo.roomKey).emit("vote panel");
  });

  socket.on("update players", function (player) {
    socket.to(roomInfo.roomKey).emit("update inJail", { socketId: player.socketId, inJail: player.inJail });
  });

  // when a player update the gold team normal
  socket.on("update goldTeamNormalGui", function (gold) {
    socket.to(roomInfo.roomKey).emit("All update goldTeamNormalGui", gold);
  });

  // when a player update the gold team impostor
  socket.on("update goldTeamImpostorGui", function (gold) {
    socket.to(roomInfo.roomKey).emit("All update goldTeamImpostorGui", gold);
  });

  // when a player mines, play animation
  socket.on("player mining", function () {
    socket.to(roomInfo.roomKey).emit("player mined", roomInfo.players[socket.id]);
  });

  // when a player transform
  socket.on("transform player", function (data) {
    socket.to(roomInfo.roomKey).emit("transformed player", [roomInfo.players[socket.id], data]);
  });

  // when a player stops mining, stop animation
  socket.on("player stop mining", function () {
    socket.to(roomInfo.roomKey).emit("player mine stopped", roomInfo.players[socket.id]);
  });

  socket.on("disable ore", function (ore) {
    socket.to(roomInfo.roomKey).emit("delete ore", ore);
  });

  // count total votes
  socket.on("vote", function (socketId) {
    socket.to(roomInfo.roomKey).emit("count votes", socketId);
  });

  // count total votes
  socket.on("start timer", function () {
    let timer = 10;

    const interval = setInterval(() => {
      timer--;
      if (timer > -1) {
        socket.to(roomInfo.roomKey).emit("timer", timer);
      }
      if (timer == 0) clearInterval(interval);
    }, 1000);
  });

  // disable voting panel for all players
  socket.on("voting panel disabled", function () {
    socket.to(roomInfo.roomKey).emit("disable voting panel");
  });

  // enable voting panel for all players
  socket.on("voting panel enabled", function () {
    socket.to(roomInfo.roomKey).emit("enable voting panel");
  });
}
