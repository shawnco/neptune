const Calendar = require('./../../models/calendar');
const Event = require('./../../models/event');
const Task = require('./../../models/task');
const {faker} = require('@faker-js/faker');
const {Op} = require('sequelize').Sequelize;

const calendarJson = ({
    name
} = {}) => ({
    name: name || 'test-' + faker.name.firstName()
});

const eventJson = ({
    name
} = {}) => ({
    name: name || 'test-' + faker.name.firstName()
});

const taskJson = ({
    name,
    completed,
    calendar
} = {}) => ({
    name: name || 'test-' + faker.name.firstName(),
    completed: completed !== null && completed !== undefined ? completed : faker.helpers.arrayElement([true, false]),
    calendar: calendar || faker.datatype.number({min: 1, max: 100})
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
    deleteTestTasks
};