const service = require("./reservations.service");
const hasProperties = require("../errors/hasProperties");

const requiredProperties = [
  "first_name",
  "last_name",
  "mobile_number",
  "reservation_date",
  "reservation_time",
  "people",
];
/**
 * List handler for reservation resources
 */
async function list(req, res, next) {
  const date = req.query.date;
  const mobile_number = req.query.mobile_number;

  if (date) {
    return res.json({ data: await service.listByDate(date) });
  }

  if (mobile_number) {
    return res.json({ data: await service.listByMobileNumber(mobile_number) });
  }

  return res.json({ data: await service.list() });
}

/**
 * Create handler for reservation resources
 */
async function create(req, res, next) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

/**
 * Read handler for reservation resources
 */
async function read(req, res, next) {
  const { reservation_id } = req.params;
  const data = await service.read(reservation_id);
  return res.json({ data });
}

async function update(req, res, next) {
  const { reservation_id } = req.params;
  const data = await service.update(reservation_id, req.body.data);
  
  return res.json({ data });
}

async function updateReservation(req, res, next) {
  const { reservation_id } = req.params;
  const data = await service.updateReservation(reservation_id, req.body.data);
  return res.json({ data });
}

//Helper functions
function validateProperties(req, res, next) {
  const { reservation_date, reservation_time, people, status } = req.body.data;

  try {
    if (!validateDate(reservation_date)) {
      const error = new Error(
        `reservation_date '${reservation_date}' is invalid.`
      );
      error.status = 400;
      throw error;
    }
    if (!validateTime(reservation_time)) {
      const error = new Error(
        `reservation_time '${reservation_time}' is invalid.`
      );
      error.status = 400;
      throw error;
    }
    if (!validatePeople(people)) {
      const error = new Error(`people property of '${people}' is invalid.`);
      error.status = 400;
      throw error;
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

function validateDate(date) {
  let date_regex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
  const truthy = date_regex.test(date);
  if (truthy) {
    //validate reservation is not in the past
    const [year, month, day] = date.split("-");
    const reservationDate = new Date(year, month - 1, day);
    const today = new Date();
    const error = new Error(
      `reservation_date '${date}' is in the past. Reservations must be made for future dates.`
    );
    error.status = 400;
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
    }

    //validate reservation is not on a Tuesday
    if (reservationDate.getDay() === 2) {
      const error = new Error(`The restaurant is closed on Tuesdays.`);
      error.status = 400;
      throw error;
    }
  }
  return truthy;
}
function validateTime(time) {
  let time_regex = /^(2[0-3]|[01][0-9]):[0-5][0-9]$/;
  if (time_regex.test(time)) {
    const [hour, minute] = time.split(":");
    if ((hour == 10 && minute < 30) || (hour == 21 && minute > 30) || hour < 10 || hour > 21) {
      const error = new Error(
        `reservation_time '${time}' is outside of restaurant hours. Reservations must be made between 10:30 and 21:30.`
      );
      error.status = 400;
      throw error;
    }
  }
  return time_regex.test(time);
}

function validatePeople(people) {
  let people_regex = /^[0-9]+$/;
  if (!(typeof people == "number")) return false;
  return people_regex.test(people);
}

async function validateReservationId(req, res, next) {
  const { reservation_id } = req.params;
  const data = await service.read(reservation_id);
  try {
    if (!data) {
      const error = new Error(
        `reservation_id '${reservation_id}' does not exist.`
      );
      error.status = 404;
      throw error;
    }
  } catch (error) {
    return next(error);
  }
  return next();
}

/* Status must be booked for Post, otherwise returns 400 */
async function validateStatusBookedPost(req, res, next) {
  const data = req.body.data;
  try {
    if (data.status === "seated" || data.status === "finished") {
      const error = new Error(
        `status '${data.status}' is invalid. Must be "booked"`
      );
      error.status = 400;
      throw error;
    }
  } catch (error) {
    return next(error);
  }
  return next();
}

async function validateStatusBookedPut(req, res, next) {
  const data = req.body.data;
  const validStatuses = ["booked", "seated", "finished", "cancelled"];

  try {
    if (!validStatuses.includes(data.status)) {
      const error = new Error(
        `status '${data.status}' is invalid. Must be "seated" or "finished"`
      );
      error.status = 400;
      throw error;
    }
  } catch (error) {
    return next(error);
  }
  return next();
}

async function validateNotCurrentlyFinished(req, res, next) {
  const { reservation_id } = req.params;
  const data = await service.read(reservation_id);
  try {
    if (data.status === "finished") {
      const error = new Error(
        `reservation_id '${reservation_id}' is already finished.`
      );
      error.status = 400;
      throw error;
    }
  } catch (error) {
    return next(error);
  }
  return next();
}

function validateUpdateProperties(req, res, next){
  const { reservation_date, reservation_time, people, status } = req.body.data;
  
  let date_regex = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1])$/;
  const dateTruthy = date_regex.test(reservation_date);
  let people_regex = /^[0-9]+$/;
  let peopleTruthy;

  let time_regex = /^(2[0-3]|[01][0-9]):[0-5][0-9]$/;
  const timeTruthy = time_regex.test(reservation_time);
  
  if (!(typeof people == "number")){
    peopleTruthy = false
  }else{
    peopleTruthy = people_regex.test(people);
  }

  
  try {
    if (!dateTruthy) {
      const error = new Error(
        `reservation_date '${reservation_date}' is invalid.`
      );
      error.status = 400;
      throw error;
    }
    if (!timeTruthy) {
      const error = new Error(
        `reservation_time '${reservation_time}' is invalid.`
      );
      error.status = 400;
      throw error;
    }
    if (!peopleTruthy) {
      const error = new Error(`people property of '${people}' is invalid.`);
      error.status = 400;
      throw error;
    }

    return next();
  } catch (error) {
    return next(error);
  }
}

function asyncErrorBoundary(delegate, defaultStatus) {
  return (request, response, next) => {
    Promise.resolve()
      .then(() => delegate(request, response, next))
      .catch((error = {}) => {
        const { status = defaultStatus, message = error } = error;
        next({
          status,
          message,
        });
      });
  };
}

module.exports = {
  list: asyncErrorBoundary(list),
  create: [
    hasProperties(...requiredProperties),
    validateProperties,
    asyncErrorBoundary(validateStatusBookedPost),
    asyncErrorBoundary(create),
  ],
  read: [asyncErrorBoundary(validateReservationId), asyncErrorBoundary(read)],
  update: [
    asyncErrorBoundary(validateReservationId),
    asyncErrorBoundary(validateNotCurrentlyFinished),
    asyncErrorBoundary(validateStatusBookedPut),
    hasProperties("status"),
    asyncErrorBoundary(update),
  ],
  updateReservation: [
    asyncErrorBoundary(validateReservationId),
     asyncErrorBoundary(validateNotCurrentlyFinished),
     hasProperties(...requiredProperties),
     validateUpdateProperties,
    asyncErrorBoundary(updateReservation),
  ],
};
