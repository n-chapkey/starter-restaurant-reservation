import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function NewTable() {
  const initialFormData = {
    table_name: "",
    capacity: 0,
  };
  const [formData, setFormData] = useState({ ...initialFormData });
  const [error, setError] = useState(null);

  const handleChange = ({ target }) => {
    if (target.name === "capacity") {
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

  const handleSubmit = (event) => {
    event.preventDefault();
    const abortController = new AbortController();

    createTable(formData, abortController.signal)
      .then(() => history.push(`/dashboard`))
      .catch(setError);
    return () => abortController.abort();
  };

  const history = useHistory();
  function handleCancel() {
    history.goBack();
  }

  return (
    <div>
      <h1>New Table</h1>
      <ErrorAlert error={error} />
      <form onSubmit={handleSubmit}>
        <label htmlFor="table_name">Table Name</label>
        <input onChange={handleChange} name="table_name" />
        <label htmlFor="capacity">Capacity</label>
        <input onChange={handleChange} name="capacity" />
        <button type="submit">Submit</button>
        <button type="button" onClick={handleCancel}>
          Cancel
        </button>
      </form>
    </div>
  );
}

export default NewTable;
