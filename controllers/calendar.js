const Service = require('./../services/calendar');
const TaskService = require('./../services/task');

module.exports = {
    async getAll() {
        return Service.getAll();
    }, 

    async get(id) {
        return Service.get(id);
    },

    async create(data) {
        return Service.create(data);
    },

    async update(id, data) {
        return Service.update(id, data);
    },

    async delete(id) {
        // check here to ensure it's not
        // the active calendar
        return Service.delete(id);
    },

    async getActiveCalendar() {
        return Service.getActiveCalendar();
    },

    async setActiveCalendar(id, queue) {
        const calendar = await Service.setActiveCalendar(id);
        const tasks = await Service.getCronTasks(id);
        await queue.rebuildQueue(tasks);
        return {calendar, tasks};
    },

    async getActiveTasksInRange(start, end) {
        const {id} = await Service.getActiveCalendar();
        const days = TaskService.datesToDays(start, end);
        const months = TaskService.datesToMonths(start, end);
        return {
            daily: await TaskService.getDailyTasks(id),
            weekly: await TaskService.getWeeklyTasks(days, id),
            monthly: await TaskService.getMonthlyTasks(months, id)
        }
    }
}