import React, { useState } from "react";
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
    if (target.name === "people") {
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
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const abortController = new AbortController();
    try {
      await createReservation(formData, abortController.signal);
    } catch (err) {
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
      <FormReservation
        handleSubmit={handleSubmit}
        handleChange={handleChange}
        initialData={initialFormData}
      ></FormReservation>
    </div>
  );
}

export default NewReservation;
