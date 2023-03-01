import React, { useState } from "react";
import { searchReservation } from "../utils/api";
import RenderReservations from "../reservations/RenderReservations";
import ErrorAlert from "../layout/ErrorAlert";
function Search() {
  const [error, setError] = useState(null);
  const [reservations, setReservations] = useState([]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const abortController = new AbortController();
    const mobile_number = event.target.mobile_number.value;
    try {
      const response = await searchReservation(
        mobile_number,
        abortController.signal
      );
      setReservations(response);
    } catch (error) {
      setError(error);
    }
  };

  return (
    <div>
      <h1>Search</h1>
      <ErrorAlert error={error} />
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="mobile_number"
          id="mobile_number"
          placeholder="Enter a customer's phone number"
          pattern="[0-9 \-]+"
        />
        <button type="submit">Find</button>
      </form>
      <RenderReservations reservations={reservations} />
    </div>
  );
}

export default Search;
