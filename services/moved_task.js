const Task = require('./../models/task');
const MovedTask = require('./../models/moved_task');

module.exports = {
    async getAll() {
        return MovedTask.findAll();
    },

    async get(id) {
        return MovedTask.findByPk(id);
    },

    async getByTask(task) {
        return MovedTask.find({
            where: {
                original_task: task
            }
        });
    },

    async create(data) {
        return MovedTask.create(data);
    },

    async update(id, data) {
        const task = await MovedTask.findByPk(id);
        task.original_task = data.original_task || task.original_task;
        task.cron_string = data.cron_string || task.cron_string;
        return task;
    },

    async delete(id) {
        return MovedTask.destroy({where:{id}});
    }
}