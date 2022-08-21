// todo: add error handling and such later
const Calendar = require('./../models/calendar');
const Task = require('./../models/task');

module.exports = {
    async getAll() {
        return Calendar.findAll();
    },

    async get(id) {
        return Calendar.findByPk(id);
    },

    async create(data) {
        return Calendar.create(data);
    },

    async update(id, data) {
        const calendar = await Calendar.findByPk(id);
        calendar.name = data.name || calendar.name;
        return calendar.save();
    },

    async delete(id) {
        return Calendar.destroy({where:{id}});
    },

    async getTasks(id) {
        return Task.findAll({where:{calendar: id}});
    }
}