const knex = require("../db/connection");

function create(reservation){
    return knex("reservations")
    .insert(reservation)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

function read(reservation_id){
    return knex("reservations")
    .select("*")
    .where({reservation_id})
    .first();
}

function list(){
    return knex("reservations")
    .select("*")
    .orderBy("reservation_date");

}

function listByDate(date){
    return knex("reservations")
    .select("*")
    .where({reservation_date: date})
    .whereNot({status: "finished"})
    .orderBy("reservation_time");
}

/** Works for partial mobile_number match */
function listByMobileNumber(mobile_number){
    // return knex("reservations")
    // .select("*")
    // .where("mobile_number", "like", `%${mobile_number}%`)
    // .orderBy("reservation_date");
    return knex("reservations")
    .whereRaw(
      "translate(mobile_number, '() -', '') like ?",
      `%${mobile_number.replace(/\D/g, "")}%`
    )
    .orderBy("reservation_date");
}

function update(reservation_id, data){
    const {status} = data;
    return knex("reservations")
    .where({reservation_id})
    .update({status})
    .returning("*")
    .then((updatedRecords) => updatedRecords[0]);
}

function updateReservation(reservation_id, reservation){
    return knex("reservations")
    .where({reservation_id})
    .update(reservation)
    .returning("*")
    .then((updatedRecords) => updatedRecords[0]);
}

module.exports = {
    create,
    list,
    listByDate,
    read,
    update,
    listByMobileNumber,
    updateReservation,
};
