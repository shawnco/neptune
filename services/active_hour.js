const ActiveHour = require('./../models/active_hour');
const {isNil} = require('lodash');

module.exports = {
    async getAll() { return ActiveHour.findAll(); },

    async get(id) { return ActiveHour.findByPk(id); },

    async create(data) { return ActiveHour.create(data); },

    async update(id, data) {
        const hour = await ActiveHour.findByPk(id);
        hour.calendar = data.calendar || hour.calendar;
        hour.day = !isNil(data.day) ? data.day : hour.day;
        hour.start = !isNil(data.start) ? data.start : hour.start;
        hour.end = !isNil(data.end) ? data.end : hour.end;
        return hour.save();
    },

    async delete(id) {
        return ActiveHour.destroy({where:{id}});
    },

    async getByCalendar(calendar) {
        return ActiveHour.findAll({where:{calendar}});
    },

    async getActiveDay(calendar, day) {
        return ActiveHour.findOne({where:{calendar, day}});
    }
}