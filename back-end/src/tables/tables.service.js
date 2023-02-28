const knex = require("../db/connection");

function create(table){
    return knex("tables")
    .insert(table)
    .returning("*")
    .then((createdRecords) => createdRecords[0]);
}

function readTableByName(table_name){
    return knex("tables")
    .select("*")
    .where({table_name})
    .first();
}

function update(table_id, reservation_id){
    return knex("tables")
    .where({table_id})
    .update({reservation_id})
    .returning("*")
    .then((updatedRecords) => updatedRecords[0]);
}

function list(){
    return knex("tables").select("*")
    .orderBy("table_name");
}

function read(table_id){
    return knex("tables")
    .select("*")
    .where({table_id})
    .first();
}

function deleteReservationId(table_id){
    return knex("tables")
    .where({table_id})
    .update({reservation_id: null})
    .returning("*")
    .then((updatedRecords) => updatedRecords[0]);
}

module.exports = {
    create,
    list,
    update,
    read,
    readTableByName,
    deleteReservationId,
};