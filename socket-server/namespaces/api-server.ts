import socketIO from "socket.io";
import controller from "../controllers";

const getApiServerNamespace = (io: socketIO.Server) => {
  const apiServerNamespace = io.of("/api-server");

  apiServerNamespace.on("connection", async (socket: socketIO.Socket) => {
    socket.on("disconnecting", async () => {});

    socket.on("cancelBooking", async (scheduleId: string, seatIdArray: [string]) => {
      await controller.setUnSoldSeats(socket.id, scheduleId, seatIdArray);
      const seats = await controller.getSeatDataByScheduleId(scheduleId);
      const counts = await controller.getAllClassCount(scheduleId);

      io.of("/client").to(`${scheduleId}-booking`).emit("receiveSeat", seats);
      io.of("/client").to(`${scheduleId}-booking`).emit("receiveCount", counts);
      io.of("/client").to(`${scheduleId}-count`).emit("receiveCount", counts);
    });

    socket.on("bookSeat", async (scheduleId: string, seatIdArray: [string]) => {
      await controller.setSoldSeats(socket.id, scheduleId, seatIdArray);
      const seats = await controller.getSeatDataByScheduleId(scheduleId);

      io.of("/client").to(`${scheduleId}-booking`).emit("receiveSeat", seats);
    });
  });
};

export default getApiServerNamespace;
