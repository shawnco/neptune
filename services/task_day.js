const TaskDay = require('./../models/task_day');

module.exports = {
    async getByTask(task) {
        return TaskDay.findAll({
            where: {
                task
            }
        });
    },

    async deleteByTask(task) {
        return TaskDay.destroy({
            where: {
                task
            }
        });
    },

    async createByTask(task, days) {
        const rows = days.map(d => ({task, day: d}));
        return TaskDay.bulkCreate(rows);
    },

    async updateByTask(task, days) {
        // we'll keep it simple and do a clean
        // delete and re-add
        await this.deleteByTask(task);
        return this.createByTask(task, days);
    }
}