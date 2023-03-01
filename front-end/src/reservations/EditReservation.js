import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { readReservation } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";
import FormReservation from "./FormReservation";
import { updateReservation } from "../utils/api";
import formatReservationDate from "../utils/format-reservation-date";

function EditReservation() {
  const history = useHistory();
  const { reservation_id } = useParams();
  const [reservation, setReservation] = useState({});
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReservation(reservation_id);
  }, [reservation_id]);


  async function loadReservation(reservation_id) {
    const abortController = new AbortController();
    try {
      const response = await readReservation(
        reservation_id,
        abortController.signal
      );
      setReservation(formatReservationDate(response));
    } catch (error) {
      return () => abortController.abort();
    }
  }

  function formatReservationForm(reservation) {
    //setReservation(formatReservationDate(reservation));

    return {
      first_name: reservation.first_name,
      last_name: reservation.last_name,
      mobile_number: reservation.mobile_number,
      reservation_date: reservation.reservation_date,
      reservation_time: reservation.reservation_time,
      people: reservation.people,
    };
  }

  function handleChange({ target }) {
    setReservation({
      ...reservation,
      [target.name]: target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const abortController = new AbortController();

    try {
      await updateReservation(
        reservation_id,
        reservation,
        abortController.signal
      );
      history.push(`/dashboard?date=${reservation.reservation_date}`);
    } catch (error) {
      setError(error);
    }
  }

  return (
    <div>
      <h1>Edit Reservation</h1>
      <ErrorAlert error={error} />
      <FormReservation
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        initialData={formatReservationForm(reservation)}
      />
    </div>
  );
}

export default EditReservation;
