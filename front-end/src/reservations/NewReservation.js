import React, { useState} from "react";
import { useHistory } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { createReservation } from "../utils/api";
import FormReservation from "./FormReservation";

function NewReservation() {
  const initialFormData = {
    first_name: "",
    last_name: "",
    mobile_number: "",
    reservation_date: "",
    reservation_time: "",
    people: 0,
  };

  const [formData, setFormData] = useState({ ...initialFormData });
  const [error, setError] = useState(null);
  const history = useHistory();

  const handleChange = ({ target }) => {
    if ((target.name === "people")) {
      setFormData({
        ...formData,
        [target.name]: Number(target.value),
      });
    } else {
      setFormData({
        ...formData,
        [target.name]: target.value,
      });
    }

    console.log(formData.reservation_date);
  };

  function validateDate(date) {

      //validate reservation is not in the past
      const [year, month, day] = date.split("-");
      const reservationDate = new Date(year, month - 1, day);
      const today = new Date();
      let error = new Error(
        `reservation_date '${date}' is in the past. Reservations must be made for future dates.`
      );
      if (reservationDate.getFullYear() < today.getFullYear()) {
        throw error;
      } else if (reservationDate.getFullYear() === today.getFullYear()) {
        if (reservationDate.getMonth() < today.getMonth()) {
          throw error;
        } else if (reservationDate.getMonth() === today.getMonth()) {
          if (reservationDate.getDate() < today.getDate()) {
            throw error;
        }
      }
  
      //validate reservation is not on a Tuesday
      if (reservationDate.getDay() === 2) {
        error = new Error(`The restaurant is closed on Tuesdays.`);
        throw error;
      }
    }
  }
  const handleSubmit = async (event) => {
    event.preventDefault();

    const abortController = new AbortController();
    try{

      await createReservation(formData, abortController.signal);
    }catch(err){
      setError(err);
      return;
    }
    setFormData({ ...initialFormData });
    history.push(`/dashboard?date=${formData.reservation_date}`);
  };



  return (
    <div>
      <ErrorAlert error={error}></ErrorAlert>
      <h1>NewReservation component by Nick</h1>
      <FormReservation handleSubmit={handleSubmit} handleChange={handleChange} initialData={initialFormData}></FormReservation>
    </div>
  );
}

export default NewReservation;
