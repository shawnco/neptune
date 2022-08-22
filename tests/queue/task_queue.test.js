const {expect} = require('chai');
const TaskQueue = require('./../../queue/task_queue');
const CalendarService = require('./../../services/calendar');
const TaskService = require('./../../services/task');
const {
    calendarJson,
    taskJson,
    deleteTestCalendars,
    deleteTestTasks
} = require('./../services/helpers');

describe.only('Task queue ops', () => {
    let queue;

    beforeEach(async () => {
        queue = new TaskQueue();
        await deleteTestCalendars();
        await deleteTestTasks();
    });

    afterEach(async () => {
        await queue.clean();
    });

    it('should empty the queue', async () => {
        const queue = new TaskQueue();
        await queue.clean();
    });

    it('should have all the tasks associated with a calendar', async () => {
        const calendar = await CalendarService.create(calendarJson());
        const task1 = await TaskService.create(taskJson({calendar: calendar.id}));
        const task2 = await TaskService.create(taskJson({calendar: calendar.id}));
        const task3 = await TaskService.create(taskJson({calendar: calendar.id}));
        const tasks = await CalendarService.getCronTasks(calendar.id);
        await Promise.all(tasks.map(t => queue.addTask(t)));
        const count = await queue.getTaskCount();
        expect(count).to.equal(3);
        // also verify we have the right jobs in, as indicated by cron string
        const jobs = await queue.getJobs();
        const cron1 = jobs.find(f => f.cron == task1.cron_string);
        const cron2 = jobs.find(f => f.cron == task2.cron_string);
        const cron3 = jobs.find(f => f.cron == task3.cron_string);
        expect(cron1).not.to.equal(undefined);
        expect(cron2).not.to.equal(undefined);
        expect(cron3).not.to.equal(undefined);
    });
});