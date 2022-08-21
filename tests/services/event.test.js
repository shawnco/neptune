const {expect} = require('chai');
const Event = require('./../../models/event');
const Service = require('./../../services/event');
const {
    eventJson,
    deleteTestEvents
} = require('./helpers');

describe('Event CRUD ops', () => {
    beforeEach(async () => {
        await deleteTestEvents();
    });

    it('should return no events if none exist', async () => {
        const events = await Service.getAll();
        expect(events.length).to.equal(0);
    });

    it('should create then retrieve an event', async () => {
        const testEvent = eventJson();
        const result = await Service.create(testEvent);
        const event = await Service.get(result.id);
        expect(event.id).to.equal(result.id);
        expect(event.name).to.equal(result.name);
    });

    it('should create an event', async () => {
        const testEvent = eventJson();
        const event = await Service.create(testEvent);
        expect(event.name).to.equal(testEvent.name);
    });

    it('should update an event', async () => {
        const oldEvent = eventJson();
        const newEvent = eventJson();
        const {id} = await Service.create(oldEvent);
        const event = await Service.update(id, newEvent);
        expect(event.name).to.equal(newEvent.name);
    });

    it('should delete an event', async () => {
        const event = eventJson();
        const {id} = await Service.create(event);
        const count = await Service.getAll();
        expect(count.length).to.equal(1);
        const del = await Service.delete(id);
        const newCount = await Service.getAll();
        expect(newCount.length).to.equal(0);
    });
});