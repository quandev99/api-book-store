export const SocketIo = (io) => {
  io.on("connection", (socket) => {
    console.log("[Socket] Connected:", socket.id);
    socket.on("disconnect", () => {
      console.log("Client disconnected:::: ", 1);
    });

   socket.on("authenticate", ({ userId, isAdmin }) => {
     console.log("authenticate::: ", userId, isAdmin);
     socket.userId = userId;
     const userRoom = `UserRoom_${userId}`;
     socket.join(userRoom);
     if (isAdmin) {
       const adminRoom = "AdminRoom";
       socket.join(adminRoom);
     }
   });

   socket.on("client_newNotify", (data) => {
     console.log("client_newNotify", data);
     const userId = socket.userId;
     const userRoom = `UserRoom_${userId}`;
     const adminRoom = "AdminRoom";
     io.to(userRoom).emit("server_newNotify", data);
     if (socket.rooms.has(adminRoom)) {
       io.to(adminRoom).emit("server_newNotify", data);
     }
   });
    // io.engine.on("connection_error", (err) => {
    //   console.log(2,err.req); // the request object
    //   console.log(3,err.code); // the error code, for example 1
    //   console.log(4,err.message); // the error message, for example "Session ID unknown"
    //   console.log(5,err.context); // some additional error context
    // });
  });
};
