import React from "react";
import { useHistory } from "react-router-dom";
function FormReservation({ handleSubmit, handleChange, initialData }) {
  const history = useHistory();

  const handleCancel = () => {
    history.goBack();
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="first_name">First Name</label>
      <input
        type="text"
        onChange={handleChange}
        name="first_name"
        id="first_name"
        defaultValue={initialData.first_name}
      />
      <label htmlFor="last_name">Last Name</label>
      <input
        type="text"
        onChange={handleChange}
        name="last_name"
        id="last_name"
        defaultValue={initialData.last_name}
      />
      <label htmlFor="mobile_number">Mobile Number</label>
      <input
        type="text"
        onChange={handleChange}
        name="mobile_number"
        id="mobile_number"
        pattern="[0-9 \-]+"
        defaultValue={initialData.mobile_number}
      />
      <label htmlFor="reservation_date">Reservation Date</label>
      <input
        type="date"
        onChange={handleChange}
        name="reservation_date"
        id="reservation_date"
        defaultValue={initialData.reservation_date}
      />
      <label htmlFor="reservation_time">Reservation Time</label>
      <input
        type="time"
        onChange={handleChange}
        name="reservation_time"
        id="reservation_time"
        defaultValue={initialData.reservation_time}
      />
      <label htmlFor="people">People</label>
      <input 
        type="number" 
        onChange={handleChange} 
        name="people" 
        id="people"
        defaultValue={initialData.people}
      />
      <button type="submit">Submit</button>
      <button onClick={handleCancel} type="button">
        Cancel
      </button>
    </form>
  );
}

export default FormReservation;
