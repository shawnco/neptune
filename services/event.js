const Event = require('./../models/event');

module.exports = {
    async getAll() {
        return Event.findAll();
    },

    async get(id) {
        return Event.findByPk(id);
    },

    async create(data) {
        return Event.create(data);
    },

    async update(id, data) {
        const event = await Event.findByPk(id);
        event.name = data.name || event.name;
        event.duration = data.duration || event.duration;
        return event.save();
    },

    async delete(id) {
        return Event.destroy({where:{id}});
    }
}