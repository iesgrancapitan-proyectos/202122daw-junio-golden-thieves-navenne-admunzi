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

      socket.on("choose thieves", function() {
        let amountPlayers = roomInfo.numPlayers;
        let amountThiefs = 0;
        if (12 >= amountPlayers && amountPlayers >= 10) {
          amountThiefs = 3;
        } else if (9 >= amountPlayers && amountPlayers >= 5) {
          amountThiefs = 2;
        } else {
          amountThiefs = 1;
        }

        let aListSocketIds = Object.keys(roomInfo.players);

        while (amountThiefs != 0) {
          let socketAleatory = aListSocketIds[Math.floor(Math.random() * amountPlayers)];
          if (roomInfo.players[socketAleatory].thief == false) {
            roomInfo.players[socketAleatory].thief = true;
            --amountThiefs;
          }
        }
      });

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
    });

    // start MainScene for everyone
    socket.on("start game", function(data) {
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

    // when a player use stun ability, the player is stunned
    socket.on("stun player", function (id) {
      // emit the stun to the player
      io.to(id).emit('i am stunned', null , function(data) {});
    });

    // move player from jail to center map
    socket.on("leave jail", function (id) {
      // remove player from jail
      io.to(id).emit('i am out jail');
    });

    // when a player use break tool ability
    socket.on("breakTool player", function (id) {
      // emit break tool to the player
      io.to(id).emit('broken tool', null , function(data) {});
    });

    // when a player use steal ability
    socket.on("steal player", function (data) {
      console.log(data);
      console.log("steal player");
      io.to(data.objective).emit('stolen player', data);
    });

    // return the stolen money
    socket.on("send money stolen", function (data) {
      io.to(data.origin).emit('save stolen money', data);
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
      thief: false,
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
