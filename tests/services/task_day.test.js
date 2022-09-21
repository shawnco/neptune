const {expect} = require('chai');
const Task = require('./../../models/task');
const TaskDay = require('./../../models/task_day');
const Service = require('./../../services/task_day');
const {
    deleteTestTasks,
    deleteTestTaskDays,
    taskJson
} = require('./helpers');

describe('Task day CRUD ops', () => {
    let testTaskIds = [];
    beforeEach(async () => {
        await deleteTestTasks();
    });

    afterEach(async () => {
        await deleteTestTaskDays(testTaskIds);
        testTaskIds = [];
    });

    it('should return the right amount of days for the task', async () => {
        const task = await Task.create(taskJson());
        testTaskIds.push(task.id);

        await TaskDay.bulkCreate([
            {task: task.id, day: 1},
            {task: task.id, day: 2},
            {task: task.id, day: 3}
        ]);

        const days = await Service.getByTask(task.id);
        expect(days.length).to.equal(3);
        const d1 = days.find(d => d.task == task.id && d.day == 1);
        const d2 = days.find(d => d.task == task.id && d.day == 2);
        const d3 = days.find(d => d.task == task.id && d.day == 3);
        expect(d1).not.to.equal(undefined);
        expect(d2).not.to.equal(undefined);
        expect(d3).not.to.equal(undefined);
    })

    it('should create the right amount of days for the task', async () => {
        const task = await Task.create(taskJson());
        testTaskIds.push(task.id);

        const days = await Service.createByTask(task.id, [1,2,3]);
        expect(days.length).to.equal(3);
        const d1 = days.find(d => d.task == task.id && d.day == 1);
        const d2 = days.find(d => d.task == task.id && d.day == 2);
        const d3 = days.find(d => d.task == task.id && d.day == 3);
        expect(d1).not.to.equal(undefined);
        expect(d2).not.to.equal(undefined);
        expect(d3).not.to.equal(undefined);
    });

    it('should update the right amount of days for the task', async () => {
        const task = await Task.create(taskJson());
        testTaskIds.push(task.id);

        await TaskDay.bulkCreate([
            {task: task.id, day: 1},
            {task: task.id, day: 2},
            {task: task.id, day: 3}
        ]);

        const days = await Service.updateByTask(task.id, [4,5]);
        expect(days.length).to.equal(2);
        const d4 = days.find(d => d.task == task.id && d.day == 4);
        const d5 = days.find(d => d.task == task.id && d.day == 5);
        expect(d4).not.to.equal(undefined);
        expect(d5).not.to.equal(undefined);

        const dayCount = await Service.getByTask(task.id);
        expect(dayCount.length).to.equal(2);
    });

    it('should delete all days for the given task', async () => {
        const task = await Task.create(taskJson());
        testTaskIds.push(task.id);

        await TaskDay.bulkCreate([
            {task: task.id, day: 1},
            {task: task.id, day: 2},
            {task: task.id, day: 3}
        ]);

        const del = await Service.deleteByTask(task.id);
        expect(del).to.equal(3);

        const count = await Service.getByTask(task.id);
        expect(count.length).to.equal(0);
    });
})