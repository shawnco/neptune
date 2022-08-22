const Calendar = require('./../../models/calendar');
const Event = require('./../../models/event');
const Task = require('./../../models/task');
const {faker} = require('@faker-js/faker');
const {Op} = require('sequelize').Sequelize;

const calendarJson = ({
    name,
    active
} = {}) => ({
    name: name || 'test-' + faker.name.firstName(),
    active: active !== null && active !== undefined ? active : faker.datatype.boolean()
});

const eventJson = ({
    name
} = {}) => ({
    name: name || 'test-' + faker.name.firstName()
});

const cronString = () => {
    const min = faker.datatype.number({min: 0, max: 59});
    const hour = faker.datatype.number({min: 0, max: 23});
    const day = faker.datatype.number({min: 1, max: 31});
    const month = faker.datatype.number({min: 1, max: 12});
    const weekday = faker.datatype.number({min: 0, max: 6});
    return `${min} ${hour} ${day} ${month} ${weekday}`;
}

const taskJson = ({
    name,
    completed,
    calendar,
    cron_string
} = {}) => ({
    name: name || 'test-' + faker.name.firstName(),
    completed: completed !== null && completed !== undefined ? completed : faker.helpers.arrayElement([true, false]),
    calendar: calendar || faker.datatype.number({min: 1, max: 100}),
    cron_string: cron_string || cronString()
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

const deleteTestTasks = async () => {Task.destroy({
    where: {
        name: {
            [Op.like]: 'test-%'
        }
    }
})

}

module.exports = {
    calendarJson,
    eventJson,
    taskJson,
    deleteTestCalendars,
    deleteTestEvents,
    deleteTestTasks,
    cronString
};