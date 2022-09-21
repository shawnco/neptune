const {expect} = require('chai');
const Task = require('./../../models/task');
const TaskDay = require('./../../models/task_day');
const Service = require('./../../services/task');
const {Op} = require('sequelize').Sequelize;
const {faker} = require('@faker-js/faker');
const {
    taskJson,
    activeHoursJson,
    deleteTestTasks,
    deleteTestTaskDays,
    cronString
} = require('./helpers');

describe('Task CRUD ops', () => {
    let testTaskIds = [];

    beforeEach(async () => {
        await deleteTestTasks();
    });
    
    afterEach(async () => {
        await deleteTestTaskDays(testTaskIds);
        testTaskIds = [];
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
        expect(task.chain).to.equal(result.chain);
        expect(task.parent).to.equal(result.parent);
        expect(task.duration).to.equal(result.duration);
    });

    it('should create a task', async () => {
        const testTask = taskJson();
        const task = await Service.create(testTask);
        expect(task.name).to.equal(testTask.name);
        expect(task.completed).to.equal(testTask.completed);
        expect(task.calendar).to.equal(testTask.calendar);
        expect(task.cron_string).to.equal(testTask.cron_string);
        expect(task.chain).to.equal(testTask.chain);
        expect(task.parent).to.equal(testTask.parent);
        expect(task.duration).to.equal(testTask.duration);
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
        expect(task.chain).to.equal(newTask.chain);
        expect(task.parent).to.equal(newTask.parent);
        expect(task.duration).to.equal(newTask.duration);
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

    describe('Fetching specifically daily/weekly/monthly tasks', () => {
        it('should get specifically daily tasks', async () => {
            const task = await Task.create(taskJson({frequency: 'daily'}));
            await Task.create(taskJson({frequency: 'weekly'}));
            await Task.create(taskJson({frequency: 'monthly'}));

            const dailyTasks = await Service.getDailyTasks();
            expect(dailyTasks.length).to.equal(1);
            expect(dailyTasks[0].id).to.equal(task.id);
        });

        it('should get specifically weekly tasks of a given day', async () => {
            await Task.create(taskJson({frequency: 'daily'}));
            await Task.create(taskJson({frequency: 'monthly'}));
            const task1 = await Task.create(taskJson({frequency: 'weekly', day: [3]}));
            await TaskDay.create({task: task1.id, day: 3});
            const task2 = await Task.create(taskJson({frequency: 'weekly', day: [6]}));
            await TaskDay.create({task: task2.id, day: 6});

            testTaskIds.push(task1.id);
            testTaskIds.push(task2.id);

            const weeklyTasks = await Service.getWeeklyTasks(6);
            expect(weeklyTasks.length).to.equal(1);
            expect(weeklyTasks[0].id).to.equal(task2.id);
        });

        it('should get specifically monthly tasks of a given day', async () => {
            await Task.create(taskJson({frequency: 'daily'}));
            const task1 = await Task.create(taskJson({frequency: 'daily'}))
            await TaskDay.create({task: task1.id, day: 3});
            const task2 = await Task.create(taskJson({frequency: 'monthly', day: 20}));
            await TaskDay.create({task: task2.id, day: 20});
            const task3 = await Task.create(taskJson({frequency: 'monthly', day: 25}));
            await TaskDay.create({task: task3.id, day: 25});

            testTaskIds.push(task1.id);
            testTaskIds.push(task2.id);
            testTaskIds.push(task3.id);

            const monthlyTasks = await Service.getMonthlyTasks(20);
            expect(monthlyTasks.length).to.equal(1);
            expect(monthlyTasks[0].id).to.equal(task2.id);
        });
    });

    describe('Checking overlaps between tasks', () => {
        it('should calculate the start and end times', () => {
            const cron = cronString();
            const [min, hour, ...rest] = cron.split(' ');
            const duration = faker.datatype.number({min: 0, max: 120});

            const start = (+hour) * 60 + (+min);
            const end = start + duration;
            const result = Service.calculateStartEnd(cron, duration);
            expect(result.start).to.equal(start);
            expect(result.end).to.equal(end);
        });

        it('should return false if the new task does not overlap the existing task', () => {
            // existing task is early in the day
            const existingCron = `${faker.datatype.number({min: 0, max: 59})} ${faker.datatype.number({min: 0, max: 11})} * * *`;
            const existingDuration = faker.datatype.number({min: 1, max: 45});
            const existingTask = taskJson({cron_string: existingCron, duration: existingDuration});

            // new task is later in the day
            const newCron = `${faker.datatype.number({min: 0, max: 59})} ${faker.datatype.number({min: 13, max: 23})} * * *`;
            const newDuration = faker.datatype.number({min: 1, max: 59});
            const newTask = taskJson({cron_string: newCron, duration: newDuration});

            const result = Service.checkOverlap(newTask, existingTask)
            expect(result.overlap).to.equal(false);
            expect(result.reason).to.equal('NONE');
        });

        it('should return true if the new task starts during the existing task', () => {
            const existingCron = '5 5 * * *';
            const existingDuration = 30;
            const existingTask = taskJson({cron_string: existingCron, duration: existingDuration});

            const newCron = '15 5 * * *';
            const newDuration = 30;
            const newTask = taskJson({cron_string: newCron, duration: newDuration});

            const result = Service.checkOverlap(newTask, existingTask);
            expect(result.overlap).to.equal(true);
            expect(result.reason).to.equal('START');
        });

        it('should return true if the new task ends during the existing task', () => {
            const existingCron = '5 5 * * * ';
            const existingDuration = 30;
            const existingTask = taskJson({cron_string: existingCron, duration: existingDuration});

            const newCron = '0 5 * * *';
            const newDuration = 30;
            const newTask = taskJson({cron_string: newCron, duration: newDuration});

            const result = Service.checkOverlap(newTask, existingTask);
            expect(result.overlap).to.equal(true);
            expect(result.reason).to.equal('END');
        });

        it('should return true if the new task envelops the existing task', () => {
            const existingCron = '5 5 * * * ';
            const existingDuration = 30;
            const existingTask = taskJson({cron_string: existingCron, duration: existingDuration});

            const newCron = '0 5 * * *';
            const newDuration = 60;
            const newTask = taskJson({cron_string: newCron, duration: newDuration});

            const result = Service.checkOverlap(newTask, existingTask);
            expect(result.overlap).to.equal(true);
            expect(result.reason).to.equal('ENVELOP');
        });
    });

    describe('Converting date time to start/end values', () => {
        it('should return one day if the start/end are in the same day', () => {
            const start = new Date('August 1, 2022 1:00 PM');
            const end = new Date('August 1, 2022 2:00 PM');
            expect(Service.datesToDays(start, end).toString()).to.equal([1].toString());
        });

        it('should return multiple days in the same week', () => {
            const start = new Date('August 1, 2022 1:00 PM');
            const end = new Date('August 5, 2022 6:00 PM');
            const result = Service.datesToDays(start, end).toString();
            const test = [1, 2, 3, 4, 5].toString();
            expect(result).to.equal(test);
        });

        it('should return multiple days when the range encompasses weeks', () => {
            const start = new Date('August 5, 2022 1:00 PM');
            const end = new Date('August 9, 2022 9:00 PM');
            const result = Service.datesToDays(start, end).toString();
            const test = [5, 6, 0, 1, 2].toString();
            expect(result).to.equal(test);
        });

        it('should return 1 day if the start/end are in same day', () => {
            const start = new Date('August 31, 2022 1:00 AM');
            const end = new Date('August 31, 2022 9:00 PM');
            const result = Service.datesToMonths(start, end).toString();
            const test = [31].toString();
            expect(result).to.equal(test);
        });

        it('should return multiple day if start/end spans days in same month', () => {
            const start = new Date('May 1, 2022 12:00 PM');
            const end = new Date('May 5, 2022 9:00 AM');
            const result = Service.datesToMonths(start, end).toString();
            const test = [1, 2, 3, 4, 5].toString();
            expect(result).to.equal(test);
        });

        it('should return multiple days crossing months', () => {
            const start = new Date('September 29, 2022 12:00 PM');
            const end = new Date('October 3, 2022 1:00 AM');
            const result = Service.datesToMonths(start, end).toString();
            const test = [29, 30, 31, 1, 2, 3].toString();
            expect(result).to.equal(test);
        });
    });

    describe('Finding gaps to move tasks', () => {
        it('should return the start of active hours if there are no tasks', () => {
            const tasks = [];
            const activeHours = activeHoursJson({
                start: 480,  // 8 am
                end: 600    // 10 am
            });
            const now = 360  // 6 am
            const newTask = taskJson({duration: 60});
            const result = Service.findFreeTime(tasks, activeHours, now, newTask);
            expect(result.start).to.equal(480);
            expect(result.end).to.equal(540);
        });

        it('should return now if there are no tasks, and now is after active hours start', () => {
            const tasks = [];
            const activeHours = activeHoursJson({start: 480, end: 600});
            const now = 500;
            const newTask = taskJson({duration: 60});
            const result = Service.findFreeTime(tasks, activeHours, now, newTask);
            expect(result.start).to.equal(500);
            expect(result.end).to.equal(560);
        });


        it('should return the start of the active hours if there is a task before active hours', () => {
            const tasks = [taskJson({cron_string: '5 5 * * *', duration: 10})];
            const activeHours = activeHoursJson({
                start: 480,
                end: 600
            });
            const now = 360;
            const newTask = taskJson({duration: 45});
            const result = Service.findFreeTime(tasks, activeHours, now, newTask);
            expect(result.start).to.equal(480);
            expect(result.end).to.equal(525);
        });

        it('shoud return now if a task is before active hours, and now is after active hours start', () => {
            
        });

        it('should return the first available spot if a task overlaps the start of active hours', async () => {
            const tasks = [taskJson({cron_string: '55 7 * * *', duration: 30})];
            const activeHours = activeHoursJson({start: 480, end: 600});
            const now = 360;
            const newTask = taskJson({duration: 60});
            const result = Service.findFreeTime(tasks, activeHours, now, newTask);
            expect(result.start).to.equal(505);
            expect(result.end).to.equal(600);
        });

        it('should return the first available spot if there are multiple available spots', async () => {

        });

        it('should return -1, -1 if there are no available spots', async () => {
            // const tasks = [taskJson({cron_string: '55 7 * * *', })]

        });

        it('should return -1, -1 if it is past the end of active hours', async () => {

        });

        it('should return -1, -1 if there is not enough time at the end of the day', async () => {

        });
    });
});