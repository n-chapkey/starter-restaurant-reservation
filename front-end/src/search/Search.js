import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { searchReservation } from "../utils/api";
import RenderReservations from "../reservations/RenderReservations";

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
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="mobile_number"
          id="mobile_number"
          placeholder="Enter a customer's phone number"
        />
        <button type="submit">Find</button>
      </form>
      <RenderReservations reservations={reservations} />
    </div>
  );
}

export default Search;
