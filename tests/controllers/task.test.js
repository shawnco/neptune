const {expect} = require('chai');
const TaskQueue = require('./../../queue/task_queue');
const Controller = require('./../../controllers/task');
const CalendarController = require('./../../controllers/calendar');
const TaskService = require('./../../services/task');
const { calendarJson, taskJson, deleteTestCalendars, deleteTestTaskDays, deleteTestTasks } = require('../services/helpers');

describe('Task controller', () => {
    let queue;
    let testTaskIds = [];

    beforeEach(async () => {
        queue = new TaskQueue();
        await deleteTestCalendars();
        await deleteTestTasks();
    });

    afterEach(async () => {
        await queue.clean();
        await deleteTestTaskDays(testTaskIds);
        testTaskIds = [];
    });

    describe('Modifying tasks part of the active calendar', () => {
        it('should rebuild the queue when adding a task to the active calendar', async () => {
            // First create the active calendar and a couple tasks
            const calendar = await CalendarController.create(calendarJson({active: false}));
            const task1 = await TaskService.create(taskJson({calendar: calendar.id}));
            const task2 = await TaskService.create(taskJson({calendar: calendar.id}));
            testTaskIds.push(task1.id);
            testTaskIds.push(task2.id);
            const result = await CalendarController.setActiveCalendar(calendar.id, queue);
            const count = await queue.getTaskCount();
            expect(count).to.equal(2);

            // Now add a new task and verify the number of task has increased
            const task = await Controller.create(taskJson({calendar: calendar.id}), queue);
            testTaskIds.push(task.task.id);
            const newCount = await queue.getTaskCount();
            expect(newCount).to.equal(3);
        });

        it('should rebuild the queue when updating a task on the active calendar', async () => {
            // First create the active calendar and a couple tasks
            const calendar = await CalendarController.create(calendarJson({active: false}));
            const task1 = await TaskService.create(taskJson({calendar: calendar.id}));
            const task2 = await TaskService.create(taskJson({calendar: calendar.id}));
            testTaskIds.push(task1.id);
            testTaskIds.push(task2.id);
            const result = await CalendarController.setActiveCalendar(calendar.id, queue);
            const count = await queue.getTaskCount();
            expect(count).to.equal(2);

            // Now update the first task
            const updatedTask = await Controller.update(task1.id, taskJson({calendar: calendar.id}), queue);
            testTaskIds.push(updatedTask.task.id);
            const newCount = await queue.getTaskCount();
            expect(newCount).to.equal(2);
        });

        it('should rebuild the queue when deleting a task from the active calendar', async () => {
            // First create the active calendar and a couple tasks
            const calendar = await CalendarController.create(calendarJson({active: false}));
            const task1 = await TaskService.create(taskJson({calendar: calendar.id}));
            const task2 = await TaskService.create(taskJson({calendar: calendar.id}));
            const result = await CalendarController.setActiveCalendar(calendar.id, queue);
            const count = await queue.getTaskCount();
            expect(count).to.equal(2);

            // Now update the first task
            const deletedTask = await Controller.delete(task1.id, queue);
            const newCount = await queue.getTaskCount();
            expect(newCount).to.equal(1);
        });
    });

    describe('Modifying tasks not part of the active calendar', () => {
        it('should not rebuild the queue when adding a task to an inactive calendar', async () => {
            // First create the active calendar and a couple tasks
            const calendar = await CalendarController.create(calendarJson({active: false}));
            const calendar2 = await CalendarController.create(calendarJson({active: false}));
            const task1 = await TaskService.create(taskJson({calendar: calendar.id}));
            const task2 = await TaskService.create(taskJson({calendar: calendar.id}));
            testTaskIds.push(task1.id);
            testTaskIds.push(task2.id);
            const result = await CalendarController.setActiveCalendar(calendar.id, queue);
            const count = await queue.getTaskCount();
            expect(count).to.equal(2);

            // Now add a new task and verify the number of task has remained constant
            const task = await Controller.create(taskJson({calendar: calendar2.id}), queue);
            testTaskIds.push(task.task.id);
            const newCount = await queue.getTaskCount();
            expect(newCount).to.equal(2);
        });

        it('should not rebuild the queue when updating a task on an inactive calendar', async () => {
            // First create the active calendar and a couple tasks
            const calendar = await CalendarController.create(calendarJson({active: false}));
            const calendar2 = await CalendarController.create(calendarJson({active: false}));
            const task1 = await TaskService.create(taskJson({calendar: calendar.id}));
            const task2 = await TaskService.create(taskJson({calendar: calendar.id}));
            const task3 = await TaskService.create(taskJson({calendar: calendar2.id}));
            testTaskIds.push(task1.id);
            testTaskIds.push(task2.id);
            testTaskIds.push(task3.id);
            const result = await CalendarController.setActiveCalendar(calendar.id, queue);
            const count = await queue.getTaskCount();
            expect(count).to.equal(2);

            // Now update the first task
            const updatedTask = await Controller.update(task3.id, taskJson({calendar: calendar2.id}), queue);
            testTaskIds.push(updatedTask.task.id);
            const newCount = await queue.getTaskCount();
            expect(newCount).to.equal(2);
        });

        it('should not rebuild the queue when deleting a task from an inactive calendar', async () => {
            // First create the active calendar and a couple tasks
            const calendar = await CalendarController.create(calendarJson({active: false}));
            const calendar2 = await CalendarController.create(calendarJson({active: false}));
            const task1 = await TaskService.create(taskJson({calendar: calendar.id}));
            const task2 = await TaskService.create(taskJson({calendar: calendar.id}));
            const task3 = await TaskService.create(taskJson({calendar: calendar2.id}));
            testTaskIds.push(task1.id);
            testTaskIds.push(task2.id);
            testTaskIds.push(task3.id);
            const result = await CalendarController.setActiveCalendar(calendar.id, queue);
            const count = await queue.getTaskCount();
            expect(count).to.equal(2);

            // Now update the first task
            const deletedTask = await Controller.delete(task3.id, queue);
            const newCount = await queue.getTaskCount();
            expect(newCount).to.equal(2);
        });
    });
});