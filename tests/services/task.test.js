const {expect} = require('chai');
const Task = require('./../../models/task');
const Service = require('./../../services/task');
const {Op} = require('sequelize').Sequelize;
const {faker} = require('@faker-js/faker');
const {
    taskJson,
    deleteTestTasks
} = require('./helpers');

describe('Task CRUD ops', () => {
    beforeEach(async () => {
        await deleteTestTasks();
    });

    it('should return no tasks if none exist', async () => {
        const tasks = await Service.getAll();
        expect(tasks.length).to.equal(0);
    });

    it('should create then retrieve a task', async () => {
        const testTask = taskJson();
        const result = await Service.create(testTask);
        const task = await Service.get(result.id);
        expect(task.id).to.equal(result.id);
        expect(task.name).to.equal(result.name);
        expect(task.completed).to.equal(result.completed);
        expect(task.calendar).to.equal(result.calendar);
        expect(task.cron_string).to.equal(result.cron_string);
    });

    it('should create a task', async () => {
        const testTask = taskJson();
        const task = await Service.create(testTask);
        expect(task.name).to.equal(testTask.name);
        expect(task.completed).to.equal(testTask.completed);
        expect(task.calendar).to.equal(testTask.calendar);
        expect(task.cron_string).to.equal(testTask.cron_string);
    });

    it('should update a task', async () => {
        const oldTask = taskJson();
        const newTask = taskJson();
        const {id} = await Service.create(oldTask);
        const task = await Service.update(id, newTask);
        expect(task.name).to.equal(newTask.name);
        expect(task.completed).to.equal(newTask.completed);
        expect(task.calendar).to.equal(newTask.calendar);
        expect(task.cron_string).to.equal(newTask.cron_string);
    });

    it('should delete a task', async () => {
        const task = taskJson();
        const {id} = await Service.create(task);
        const count = await Service.getAll();
        expect(count.length).to.equal(1);
        const del = await Service.delete(id);
        const newCount = await Service.getAll();
        expect(newCount.length).to.equal(0);
    });
});