const TaskService = require('./../services/task');
const DayService = require('./../services/task_day');
const CalendarService = require('./../services/calendar');

module.exports = {
    async getAll() {
        return TaskService.getAll();
    },

    async get(id) {
        const task = await TaskService.get(id);
        const days = await DayService.getByTask(id);
        return {task, days};
    },

    async create(data, queue) {
        const {days: daysData, ...rest} = data;
        const task = await TaskService.create(rest);
        const days = await DayService.createByTask(task.id, daysData);

        // Rebuild queue if we added to active calendar
        const activeCalendar = await CalendarService.getActiveCalendar();
        if (activeCalendar.id == task.calendar) {
            const activeTasks = await CalendarService.getTasks(activeCalendar.id);
            await queue.rebuildQueue(activeTasks);
        }

        return {task, days};
    },

    async update(id, data, queue) {
        const {days: daysData, ...rest} = data;
        const task = await TaskService.update(id, rest);
        const days = await DayService.updateByTask(task.id, daysData);

        // Rebuild queue if we updated on the active calendar
        const activeCalendar = await CalendarService.getActiveCalendar();
        if (activeCalendar.id == task.calendar) {
            const activeTasks = await CalendarService.getTasks(activeCalendar.id);
            await queue.rebuildQueue(activeTasks);
        }

        return {task, days};
    },

    async delete(id, queue) {
        const {calendar} = await TaskService.get(id);
        const task = await TaskService.delete(id);
        const days = await DayService.deleteByTask(id);

        // Rebuild queue if we deleted from the active calendar
        const activeCalendar = await CalendarService.getActiveCalendar();
        if (activeCalendar.id == calendar) {
            const activeTasks = await CalendarService.getTasks(activeCalendar.id);
            await queue.rebuildQueue(activeTasks);
        }

        return {task, days};
    },

    async checkOverlaps(task, dayOfWk, dayOfMonth) {
        const daily = await Service.getDailyTasks();
        const weekly = await Service.getWeelyTasks(dayOfWk);
        const monthly = await Service.getMonthlyTasks(dayOfMonth);
        return Service.checkOverlaps(task, [...daily, ...weekly, ...monthly]);
    },

    async getTasksInRange(start, end, calendar = null) {
        const days = Service.datesToDays(start, end);
        const months = Service.daysToMonths(start, end);
        return {
            daily: await Service.getDailyTasks(calendar),
            weekly: await Service.getWeeklyTasks(days, calendar),
            monthly: await Service.getMonthlyTasks(months, calendar)
        };
    }
}