const { expect } = require('chai');
const Calendar = require('./../../models/calendar');
const Task = require('./../../models/task');
const Service = require('./../../services/calendar');
const {faker} = require('@faker-js/faker');
const {
    deleteTestCalendars,
    deleteTestTasks,
    calendarJson,
    taskJson
} = require('./helpers');

describe('Calendar', () => {
    beforeEach(async () => {
        await deleteTestCalendars();
        await deleteTestTasks();
    });
    
    describe('Calendar CRUD ops', () => {
        it('should return no calendars if the database is empty', async () => {
            const calendars = await Service.getAll();
            expect(calendars.length).to.equal(0);
        });

        it('should create then retrieve a calendar', async () => {
            const name = 'test-' + faker.name.firstName();
            const result = await Service.create({name});
            const calendar = await Service.get(result.id);
            expect(calendar.id).to.equal(result.id);
            expect(calendar.name).to.equal(result.name);
        });

        it('should create a calendar with a name', async () => {
            const name = 'test-' + faker.name.firstName();
            const calendar = await Service.create({name});
            expect(calendar.name).to.equal(name);
        });

        it('should update a calendar with a name', async () => {
            const name = 'test-' + faker.name.firstName();
            const newName = 'test-' + faker.name.firstName();
            const {id} = await Service.create({name});
            const calendar = await Service.update(id, {name: newName});
            expect(calendar.id).to.equal(id);
            expect(calendar.name).to.equal(newName);
        });

        it('should delete a calendar', async () => {
            const name = 'test-' + faker.name.firstName();
            const {id} = await Service.create({name});
            // 1 calendar
            const count = await Service.getAll();
            expect(count.length).to.equal(1);
            // 0 calendar
            const del = await Service.delete(id);
            const newCount = await Service.getAll();
            expect(newCount.length).to.equal(0);
        });
    });

    describe('Calendar/task', () => {
        it('should count the number of task a calendar has', async () => {
            const {id} = await Service.create(calendarJson());
            const task1 = await Task.create(taskJson({calendar: id}));
            const task2 = await Task.create(taskJson({calendar: id}));
            const tasks = await Service.getTasks(id);
            expect(tasks.length).to.equal(2);

            await Task.destroy({where:{id: task1.id}});
            const newTasks = await Service.getTasks(id);
            expect(newTasks.length).to.equal(1);
        });
    });

    describe('Active calendar', () => {
        it('should mark a calendar as active', async () => {
            const cal1 = await Service.create(calendarJson({active: false}));
            // set cal1 as active
            const active = await Service.setActiveCalendar(cal1.id);
            expect(active.id).to.equal(cal1.id);
        });

        it('should fetch the active calendar', async () => {
            await Service.create(calendarJson({active: false}));
            const cal2 = await Service.create(calendarJson({active: true}));
            const active = await Service.getActiveCalendar();
            expect(active.id).to.equal(cal2.id);
            expect(active.name).to.equal(cal2.name);
        })
    })
});