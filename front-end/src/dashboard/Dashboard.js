import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { listReservations, listTables, finishTable } from "../utils/api";
import RenderReservations from "../reservations/RenderReservations";
import ErrorAlert from "../layout/ErrorAlert";

/**
 * Defines the dashboard page.
 * @param date
 *  the date for which the user wants to view reservations.
 * @returns {JSX.Element}
 */
function Dashboard({ date }) {
  const [reservations, setReservations] = useState([]);
  const [reservationsError, setReservationsError] = useState(null);
  const [tables, setTables] = useState([]);
  const history = useHistory();
  const dateParameter = new URLSearchParams(window.location.search).get("date");

  useEffect(() => {
    const abortController = new AbortController();
    async function loadDashboard() {
      setReservationsError(null);
      try {
        const reservationsFromAPI = await listReservations(
          { date },
          abortController.signal
        );
        const tablesFromAPI = await listTables(abortController.signal);

        setReservations(reservationsFromAPI);
        setTables(tablesFromAPI);
      } catch (err) {
        setReservationsError(err);
      }
    }
    loadDashboard();
    return () => abortController.abort();
  }, [date, dateParameter]);
  async function loadDashboard() {
    const abortController = new AbortController();
    setReservationsError(null);
    try {
      const reservationsFromAPI = await listReservations(
        { date },
        abortController.signal
      );
      const tablesFromAPI = await listTables(abortController.signal);

      setReservations(reservationsFromAPI);
      setTables(tablesFromAPI);
    } catch (err) {
      setReservationsError(err);
    }
    return () => abortController.abort();
  }

  function handleNext() {
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);
    const nextDateString = nextDate.toISOString().split("T")[0];
    history.push(`/dashboard?date=${nextDateString}`);
  }

  function handlePrevious() {
    const previousDate = new Date(date);
    previousDate.setDate(previousDate.getDate() - 1);
    const previousDateString = previousDate.toISOString().split("T")[0];
    history.push(`/dashboard?date=${previousDateString}`);
  }

  function handleToday() {
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    history.push(`/dashboard?date=${todayString}`);
  }

  const handleFinish = async (event) => {
    if (
      window.confirm(
        "Is this table ready to seat new guests? This cannot be undone."
      )
    ) {
      const abortController = new AbortController();
      const tableId = event.target.getAttribute("data-table-id-finish");

      await finishTable(tableId, abortController.signal);
      history.go(0);
    }
  };

  function renderTables() {
    return tables.map((table) => {
      return (
        <div key={table.table_id}>
          <h4>{table.table_name}</h4>
          <p>Capacity: {table.capacity}</p>
          <p>Reservation ID: {table.reservation_id}</p>
          <p data-table-id-status={`${table.table_id}`}>
            <strong>{table.reservation_id ? "occupied" : "free"} </strong>
          </p>
          <button data-table-id-finish={table.table_id} onClick={handleFinish}>
            Finish
          </button>
        </div>
      );
    });
  }

  return (
    <div>
      <main>
        <h1>Dashboard</h1>
        <div className="d-md-flex mb-3">
          <h4 className="mb-0">Reservations for date {date}</h4>
        </div>
        <ErrorAlert error={reservationsError} />
        <RenderReservations
          reservations={reservations}
          loadDashboard={loadDashboard}
        />
        <button onClick={handleNext}>Next</button>
        <button onClick={handlePrevious}>Previous</button>
        <button onClick={handleToday}>Today</button>
      </main>
      <div>
        <h4 className="mb-0">Tables for date {date}</h4>
        {renderTables()}
      </div>
    </div>
  );
}

export default Dashboard;
