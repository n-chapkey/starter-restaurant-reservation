import React from "react";
import { updateReservationStatus } from "../utils/api";

function RenderReservations({ reservations, loadDashboard }) {

  const handleCancel = async (reservation_id) => {
    if (
      window.confirm(
        "Do you want to cancel this reservation? This cannot be undone."
      )
    ) {
      const abortController = new AbortController();
      const status = "cancelled";
      const data = { status };
      try {
        await updateReservationStatus(
          reservation_id,
          data,
          abortController.signal
        );
        loadDashboard();
      } catch (error) {
        console.log(error);
      }        

      return () => abortController.abort();
    }
  };

  return reservations.length ? (
    reservations.map((reservation) => {
      return (
        reservation.status !== "cancelled" ? <div key={reservation.reservation_id}>
          <h4>
            {reservation.first_name} {reservation.last_name}
          </h4>
          <p>Mobile Number: {reservation.mobile_number}</p>
          <p>Reservation Date: {reservation.reservation_date}</p>
          <p>Reservation Time: {reservation.reservation_time}</p>
          <p data-reservation-id-status={reservation.reservation_id}>
            Reservation Status: {reservation.status}
          </p>
          <p>Number of People: {reservation.people}</p>
          {reservation.status === "booked" && (
            <a href={`/reservations/${reservation.reservation_id}/seat`}>
              <button>Seat</button>
            </a>
          )}
          <a href={`/reservations/${reservation.reservation_id}/edit`}>
            <button>Edit</button>
          </a>
          <button
            data-reservation-id-cancel={reservation.reservation_id}
            onClick={() => handleCancel(reservation.reservation_id)}
          >
            Cancel
          </button>
        </div> : null
      );
    })
  ) : (
    <h1>No reservations found</h1>
  );
}

export default RenderReservations;
