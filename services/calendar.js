// todo: add error handling and such later
const Calendar = require('./../models/calendar');
const Task = require('./../models/task');
const {Op} = require('sequelize').Sequelize;

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
        calendar.active = data.active !== null && data.active !== undefined ? data.active : calendar.active;
        return calendar.save();
    },

    async delete(id) {
        // note: don't delete the active calendar!!!
        return Calendar.destroy({where:{id}});
    },

    async getTasks(id) {
        return Task.findAll({where:{calendar: id}});
    },

    async getCronTasks(id) {
        return Task.findAll({
            where: {
                calendar: id,
                cron_string: {
                    [Op.not]: null
                }
            }
        });
    },

    async getActiveCalendar() {
        return Calendar.findOne({where:{active: true}});
    },

    async setActiveCalendar(id) {
        // first mark them all inactive
        await Calendar.update(
            {active: false},
            {
                where: {
                    id: {
                        [Op.not]: id
                    }
                }
            }
        );
        
        // now set and return the active one
        const calendar = await Calendar.findByPk(id);
        calendar.active = true;
        return calendar.save();
    }
}