import { gameCommunication } from "./gameCommunication";
import { getColor } from "../frontend/functions";

export function clientConnection(io) {
  let gameRooms = {};

  // when a new player connects
  io.on("connection", function (socket) {
    socket.on("joinRoom", (data) => {
      socket.join(data.roomKey);
      const roomInfo = gameRooms[data.roomKey];

      // create player
      let playerNum = Object.keys(roomInfo.players).length + 1;
      createNewPlayer(playerNum, roomInfo.players, socket, data.playerName);

      // update number of players
      roomInfo.numPlayers = Object.keys(roomInfo.players).length;

      // send a message with count of players
      const time = new Date();
      console.log(
        roomInfo.numPlayers +
          " logged in @ " +
          time.toLocaleString("es-ES", {
            timeZone: "Europe/Madrid",
            hourCycle: "h23",
            hour: "numeric",
            minute: "numeric",
          })
      );

      // set initial state
      socket.emit("setState", roomInfo);
      gameCommunication(socket, roomInfo);

      // send the players object to the new player
      socket.emit("currentPlayers", { players: roomInfo.players, numPlayers: roomInfo.numPlayers });

      // update all other players of the new player
      socket.to(data.roomKey).emit("newPlayer", {
        id: socket.id,
        playerInfo: roomInfo.players[socket.id],
        players: roomInfo.players,
        numPlayers: roomInfo.numPlayers,
      });

      // socket.on("create map", function(map) {
      //   io.to(roomKey).emit("get map", map);
      // })
    });

    // start MainScene for everyone
    socket.on("start game", function(data) {
      console.log(data);
      io.to(data.roomKey).emit("start scene", data.oresList);
    });

    // when a player disconnects, remove them from our players object
    socket.on("disconnect", function () {
      // find which room they belong to
      let roomKey = 0;
      for (let keys1 in gameRooms) {
        for (let keys2 in gameRooms[keys1]) {
          Object.keys(gameRooms[keys1][keys2]).map((el) => {
            if (el === socket.id) {
              roomKey = keys1;
            }
          });
        }
      }

      const roomInfo = gameRooms[roomKey];

      if (roomInfo) {
        console.log("user disconnected: ", socket.id);
        // send a message with count of players
        const time = new Date();
        console.log(
          roomInfo.numPlayers +
            " logged in @ " +
            time.toLocaleString("es-ES", {
              timeZone: "Europe/Madrid",
              hourCycle: "h23",
              hour: "numeric",
              minute: "numeric",
            })
        );
        // remove this player from our players object
        delete roomInfo.players[socket.id];
        // update numPlayers
        roomInfo.numPlayers = Object.keys(roomInfo.players).length;
        // emit a message to all players to remove this player
        io.to(roomKey).emit("disconnected", {
          players: roomInfo.players,
          socketId: socket.id,
          numPlayers: roomInfo.numPlayers,
        });
      }
    });

    // check if the key is correct
    socket.on("isKeyValid", function (input) {
      Object.keys(gameRooms).includes(input) ? socket.emit("keyIsValid", input) : socket.emit("keyNotValid");
    });

    // get a random code for the room
    socket.on("getRoomCode", function () {
      let key = codeGenerator();
      while (Object.keys(gameRooms).includes(key)) {
        key = codeGenerator();
      }
      gameRooms[key] = {
        roomKey: key,
        players: {},
        numPlayers: 0,
      };
      socket.emit("roomCreated", key);
    });

  });

  /**
   * @function createNewPlayer
   * @description Creates a new player
   * @param {*} socket - the socket connection
   */
  function createNewPlayer(playerNum, currentPlayers, socket, playerName) {
    return (currentPlayers[socket.id] = {
      socketId: socket.id,
      loginTime: new Date().getTime(),
      x: Math.floor(Math.random() * (3015 - 2985) + 2985),
      y: Math.floor(Math.random() * (2015 - 1985) + 1985),
      keydown: "idle",
      name: playerName,
      color: getColor(playerNum),
    });
  }

  /**
   * @function codeGenerator
   * @description Generates a random room key
   * @return code - the room key
   */
  function codeGenerator() {
    let code = "";
    let chars = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789";
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
