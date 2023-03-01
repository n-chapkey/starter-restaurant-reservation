const service = require("./tables.service");
const reservationService = require("../reservations/reservations.service");
const hasProperties = require("../errors/hasProperties");

const requiredProperties = ["table_name", "capacity"];
const requiredPropertiesForUpdate = ["reservation_id"];

/**
 * List handler for tables resources
 */
async function list(req, res, next) {
  return res.json({ data: await service.list() });
}
/**
 * Create handler for tables resources
 */
async function create(req, res, next) {
  const data = await service.create(req.body.data);
  res.status(201).json({ data });
}

/*
 * Update handler for tables resources
 */
async function update(req, res, next) {
  const { reservation_id } = req.body.data;
  const { table_id } = req.params;
  const data = await service.update(table_id, reservation_id);
  await reservationService.update(reservation_id, { status: "seated" });
  return res.json({ data });
}

/*
 * Delete handler for tables resources
 */
async function destroy(req, res, next) {
  const { table_id } = req.params;
  const readTable = await service.read(table_id);
  const { reservation_id } = readTable;
  await reservationService.update(reservation_id, { status: "finished" });
  const data = await service.deleteReservationId(table_id);
  return res.json({ data });
}

/* Returns 404 if reservation does not exist */
async function reservationExists(req, res, next) {
  const { reservation_id } = req.body.data;
  const foundReservationId = await reservationService.read(reservation_id);
  if (!foundReservationId) {
    const error = new Error(`reservation_id ${reservation_id} not found.`);
    error.status = 404;
    return next(error);
  }
  return next();
}

// Make sure Table name is at least 2 characters long
function validateTableName(req, res, next) {
  const { table_name } = req.body.data;
  if (table_name.length < 2) {
    const error = new Error(`table_name '${table_name}' is invalid.`);
    error.status = 400;
    return next(error);
  }
  return next();
}

// Make sure capacity is at least 1
function validateCapacity(req, res, next) {
  const { capacity } = req.body.data;
  if (capacity < 1 || !(typeof capacity == "number")) {
    const error = new Error(`capacity '${capacity}' is invalid.`);
    error.status = 400;
    return next(error);
  }
  return next();
}

/* Returns 400 if table does not have sufficient capacity for reservation*/
async function validateCapacityForReservation(req, res, next) {
  const { table_id } = req.params;
  const { reservation_id } = req.body.data;

  const foundTable = await service.read(table_id);
  const foundReservation = await reservationService.read(reservation_id);

  if (foundTable.capacity < foundReservation.people) {
    const error = new Error(
      `table_id ${table_id} does not have sufficient capacity for reservation_id ${reservation_id}.`
    );
    error.status = 400;
    return next(error);
  }
  return next();
}

/* Returns 400 if table is already occupied*/
async function validateTableIsOccupied(req, res, next) {
  const { table_id } = req.params;
  const foundTable = await service.read(table_id);
  if (foundTable.reservation_id) {
    const error = new Error(`table_id ${table_id} is already occupied.`);
    error.status = 400;
    return next(error);
  }
  next();
}

/* Returns 400 if table is not occupied*/
async function validateTableIsNotOccupied(req, res, next) {
  const { table_id } = req.params;
  const foundTable = await service.read(table_id);
  if (!foundTable.reservation_id) {
    const error = new Error(`table_id ${table_id} is not occupied.`);
    error.status = 400;
    return next(error);
  }
  next();
}

/* Returns 404 if table_id is not found*/
async function validateTableId(req, res, next) {
  const { table_id } = req.params;
  const foundTable = await service.read(table_id);
  if (!foundTable) {
    const error = new Error(`table_id ${table_id} not found.`);
    error.status = 404;
    return next(error);
  }
  next();
}

async function validateReservationAlreadySeated(req, res, next) {
  const { reservation_id } = req.body.data;
  const foundReservation = await reservationService.read(reservation_id);
  if (foundReservation.status === "seated") {
    const error = new Error(
      `reservation_id ${reservation_id} is already seated.`
    );
    error.status = 400;
    return next(error);
  }
  next();
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
    asyncErrorBoundary(list),
  create: [
    hasProperties(...requiredProperties),
    validateTableName,
    validateCapacity,
    asyncErrorBoundary(create),
  ],
  update: [
    hasProperties(...requiredPropertiesForUpdate),
    asyncErrorBoundary(reservationExists),
    asyncErrorBoundary(validateCapacityForReservation),
    asyncErrorBoundary(validateTableIsOccupied),
    asyncErrorBoundary(validateReservationAlreadySeated),
    asyncErrorBoundary(update),
  ],
  delete: [
    asyncErrorBoundary(validateTableId),
    asyncErrorBoundary(validateTableIsNotOccupied),
    asyncErrorBoundary(destroy),
  ],
};
