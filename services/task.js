const Task = require('./../models/task');

module.exports ={
    async getAll() {
        return Task.findAll();
    },

    async get(id) {
        return Task.findByPk(id);
    },

    async create(data) {
        return Task.create(data);
    },

    async update(id, data) {
        const task = await Task.findByPk(id);
        task.name = data.name || task.name;
        task.completed = data.completed !== null && data.completed !== undefined ? data.completed : task.completed;
        task.calendar = data.calendar || task.calendar;
        return task.save();
    },

    async delete(id) {
        return Task.destroy({where:{id}});
    }
}