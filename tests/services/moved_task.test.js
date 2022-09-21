const {expect} = require('chai');
const Task = require('./../../models/task');
const TaskDay = require('./../../models/task_day');
const MovedTask = require('./../../models/moved_task');
const Service = require('./../../services/moved_task');
const {
    taskJson,
    movedTaskJson,
    deleteTestTasks,
    deleteTestMovedTasks
} = require('./helpers');

describe('Moved tasks', () => {
    let testTaskIds = [];

    beforeEach(async () => {
        await deleteTestTasks();
    });

    afterEach(async () => {
        await deleteTestMovedTasks(testTaskIds);
        testTaskIds = [];
    });

    describe('CRUD ops', () => {
        it('should return no moved tasks if none exist', async () => {
            const tasks = await Service.getAll();
            expect(tasks.length).to.equal(0);
        });

        it('should retrieve a moved task', async () => {
            const task = await Task.create(taskJson());
            testTaskIds.push(task.id);
            const movedTask = await MovedTask.create(movedTaskJson({original_task: task.id}));
            const find = await Service.get(movedTask.id);
            expect(find.original_task).to.equal(task.id);
            expect(find.original_task).to.equal(movedTask.original_task);
            expect(find.cron_string).to.equal(movedTask.cron_string);
        });

        it('should create a moved task', async () => {
            const task = await Task.create(taskJson());
            testTaskIds.push(task.id);
            const moved = movedTaskJson({original_task: task.id});
            const result = await Service.create(moved);
            expect(result.original_task).to.equal(moved.original_task);
            expect(result.cron_string).to.equal(moved.cron_string);
        });

        it('should update a moved task', async () => {
            const task1 = await Task.create(taskJson());
            const task2 = await Task.create(taskJson());
            testTaskIds.push(task1.id);
            testTaskIds.push(task2.id);
            const moved = await MovedTask.create(movedTaskJson({original_task: task1.id}));
            // now move the task
            const result = await Service.update(moved.id, movedTaskJson({original_task: task2.id}));
            expect(result.original_task).to.equal(task2.id);
        });

        it('should delete a moved task', async () => {
            const task = await Task.create(taskJson());
            testTaskIds.push(task.id);
            const movedTask = await Service.create(movedTaskJson({original_task: task.id}));
            const count = await Service.getAll();
            expect(count.length).to.equal(1);
            await Service.delete(movedTask.id);
            const newCount = await Service.getAll();
            expect(newCount.length).to.equal(0);
        });
    });
})