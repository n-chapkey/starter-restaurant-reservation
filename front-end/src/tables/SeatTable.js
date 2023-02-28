import React, { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import ErrorAlert from "../layout/ErrorAlert";
import { listTables, seatReservation,} from "../utils/api";

function SeatTable() {
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);
  const { reservation_id } = useParams();

  const history = useHistory();

  useEffect(() => {
    const abortController = new AbortController();
    listTables(abortController.signal).then(setTables).catch(setError);
    return () => abortController.abort();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(event.target.table_id.value);
    const abortController = new AbortController();
    try {
      await seatReservation(
        reservation_id,
        event.target.table_id.value,
        abortController.signal
      );
    } catch (error) {
      setError(error);
    }

    history.push(`/dashboard`);
  };

  const displayOptions = tables.map((table) => {
    return (
      <option key={table.table_id} value={table.table_id}>
        {table.table_name} - {table.capacity}
      </option>
    );
  });

  return (
    <div>
      <h1>Seat Table</h1>
      <ErrorAlert error={error} />
      <form onSubmit={handleSubmit}>
        <label htmlFor="table_id">Table</label>
        <select name="table_id" id="table_id">
          {displayOptions}
        </select>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default SeatTable;
