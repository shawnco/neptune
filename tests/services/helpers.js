const Calendar = require('./../../models/calendar');
const Event = require('./../../models/event');
const Task = require('./../../models/task');
const TaskDay = require('./../../models/task_day');
const MovedTask = require('./../../models/moved_task');
const {faker} = require('@faker-js/faker');
const {Op} = require('sequelize').Sequelize;
const {isNil} = require('lodash');

const frequencies = ['daily', 'weekly', 'monthly'];

const calendarJson = ({
    name,
    active
} = {}) => ({
    name: name || 'test-' + faker.name.firstName(),
    active: !isNil(active) ? active : faker.datatype.boolean()
});

const eventJson = ({
    name,
    duration
} = {}) => ({
    name: name || 'test-' + faker.name.firstName(),
    duration: duration || faker.datatype.number({min: 15, max: 120})
});

const cronString = () => {
    const min = faker.datatype.number({min: 0, max: 59});
    const hour = faker.datatype.number({min: 0, max: 23});
    const day = faker.datatype.number({min: 1, max: 31});
    const month = faker.datatype.number({min: 1, max: 11});
    const weekday = faker.datatype.number({min: 0, max: 6});
    return `${min} ${hour} ${day} ${month} ${weekday}`;
}

const taskJson = ({
    name,
    completed,
    calendar,
    cron_string,
    chain,
    parent,
    duration,
    frequency,
    days,
    movable
} = {}) => ({
    name: name || 'test-' + faker.name.firstName(),
    completed: !isNil(completed) ? completed : faker.helpers.arrayElement([true, false]),
    calendar: calendar || faker.datatype.number({min: 1, max: 100}),
    cron_string: cron_string || cronString(),
    chain: chain || faker.datatype.number({min: 0, max: 20}),
    parent: parent || faker.datatype.number({min: 1, max: 20}),
    duration: duration || faker.datatype.number({min: 15, max: 120}),
    frequency: frequency || frequencies[faker.datatype.number({min: 0, max: 2})],
    days: days || [1, 2, 3],
    movable: !isNil(movable) ? movable : faker.helpers.arrayElement([true, false])
});

const movedTaskJson = ({
    original_task,
    cron_string
} = {}) => ({
    original_task: original_task || faker.datatype.number({min: 1, max: 100}),
    cron_string: cron_string || cronString()
});

const activeHoursJson = ({
    calendar,
    day,
    start,
    end
} = {}) => ({
    calendar: calendar || faker.datatype.number({min: 1, max: 100}),
    day: day || faker.datatype.number({min: 0, max: 6}),
    start: !isNil(start) ? start : faker.datatype.number({min: 0, max: 1439}),
    end: !isNil(end) ? end : faker.datatype.number({min: 0, max: 1439})
});

const deleteTestCalendars = async () => {
    return Calendar.destroy({
        where: {
            name: {
                [Op.like]: 'test-%'
            }
        }
    })
}

const deleteTestEvents = async () => {
    return Event.destroy({where:{name:{[Op.like]: 'test-%'}}});
}

const deleteTestTasks = async () => {
    Task.destroy({
        where: {
            name: {
                [Op.like]: 'test-%'
            }
        }
    });
}

const deleteTestTaskDays = async tasks => {
    return TaskDay.destroy({
        where: {
            task: tasks
        }
    });
};

const deleteTestMovedTasks = async tasks => {
    return MovedTask.destroy({
        where: {
            original_task: tasks
        }
    });
}

module.exports = {
    calendarJson,
    eventJson,
    taskJson,
    movedTaskJson,
    activeHoursJson,
    deleteTestCalendars,
    deleteTestEvents,
    deleteTestTasks,
    deleteTestTaskDays,
    deleteTestMovedTasks,
    cronString
};