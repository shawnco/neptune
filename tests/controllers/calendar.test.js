const {expect} = require('chai');
const TaskQueue = require('./../../queue/task_queue');
const Controller = require('./../../controllers/calendar');
const TaskService = require('./../../services/task');
const TaskDay = require('./../../models/task_day');
const {
    calendarJson,
    taskJson,
    deleteTestCalendars,
    deleteTestTasks,
    deleteTestTaskDays,
} = require('./../services/helpers');

describe('Calendar controller', () => {
    let queue;
    let testTaskIds = [];

    beforeEach(async () => {
        queue = new TaskQueue();
        await deleteTestCalendars();
        await deleteTestTasks();
        await deleteTestTaskDays(testTaskIds);
        testTaskIds = [];
    });

    afterEach(async () => {
        await queue.clean();
    });

    describe('Marking a calendar as active', () => {
        it('should populate the queue', async () => {
            const calendar = await Controller.create(calendarJson({active: false}));
            const task1 = await TaskService.create(taskJson({calendar: calendar.id}));
            const task2 = await TaskService.create(taskJson({calendar: calendar.id}));
            const task3 = await TaskService.create(taskJson({calendar: calendar.id}));
            const result = await Controller.setActiveCalendar(calendar.id, queue);
            // Verify we have the 3 tasks in the queue
            const count = await queue.getTaskCount();
            expect(count).to.equal(3);
            const jobs = await queue.getJobs();
            const cron1 = jobs.find(f => f.cron == task1.cron_string);
            const cron2 = jobs.find(f => f.cron == task2.cron_string);
            const cron3 = jobs.find(f => f.cron == task3.cron_string);
            expect(cron1).not.to.equal(undefined);
            expect(cron2).not.to.equal(undefined);
            expect(cron3).not.to.equal(undefined);
            // Also verify the proper calendar is marked active
            const active = await Controller.getActiveCalendar();
            expect(active.id).to.equal(calendar.id);
        });

        it('should get the active tasks for the week', async () => {
            const cal1 = await Controller.create(calendarJson({active: false}));
            const cal2 = await Controller.create(calendarJson({active: true}));
            // daily tasks
            const task1 = await TaskService.create(taskJson({frequency: 'daily', calendar: cal1.id}));
            const task2 = await TaskService.create(taskJson({frequency: 'daily', calendar: cal2.id}));
            // weekly tasks
            const task3 = await TaskService.create(taskJson({frequency: 'weekly', calendar: cal1.id}));
            TaskDay.bulkCreate([{task: task3.id, day: 3}, {task: task3.id, day: 4}, {task: task3.id, day: 5}]);
            const task4 = await TaskService.create(taskJson({frequency: 'weekly', calendar: cal2.id}));
            TaskDay.bulkCreate([{task: task4.id, day: 2}, {task: task4.id, day: 4}]);
            const task5 = await TaskService.create(taskJson({frequency: 'weekly', calendar: cal2.id}));
            TaskDay.bulkCreate([{task: task5.id, day: 5}, {task: task5.id, day: 6}]);
            testTaskIds.push(task3.id);
            testTaskIds.push(task4.id);
            testTaskIds.push(task5.id);
            // monthly tasks
            const task6 = await TaskService.create(taskJson({frequency: 'monthly', calendar: cal1.id}));
            TaskDay.bulkCreate([{task: task6.id, day: 2}, {task: task6.id, day: 4}]);
            const task7 = await TaskService.create(taskJson({frequency: 'monthly', calendar: cal2.id}));
            TaskDay.bulkCreate([{task: task7.id, day: 3}, {task: task7.id, day: 5}]);
            testTaskIds.push(task6.id);
            testTaskIds.push(task7.id);

            const start = new Date('July 31, 2022 1:00 PM');
            const end = new Date('August 6, 2022 10:00 PM');
            const activeTasks = await Controller.getActiveTasksInRange(start, end);
            expect(activeTasks.daily.length).to.equal(1);
            expect(activeTasks.weekly.length).to.equal(2);
            expect(activeTasks.monthly.length).to.equal(1);
            
            // break down and test the returned tasks
            const {daily, weekly, monthly} = activeTasks;
            // daily
            expect(daily[0].id).to.equal(task2.id);
            // weekly
            const t4find = weekly.find(w => w.id == task4.id);
            const t5find = weekly.find(w => w.id == task5.id);
            expect(t4find).not.to.equal(undefined);
            expect(t5find).not.to.equal(undefined);
            // monthly
            const t7find = monthly.find(m => m.id == task7.id);
            expect(t7find).not.to.equal(undefined);
        });
    });
});