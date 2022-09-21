const Queue = require('bull');

class TaskQueue {
    constructor() {
        this.queue = new Queue('task queue', 'redis://127.0.0.1:6379');
    }

    async clean() {
        await this.queue.empty();
        await Promise.all(['delayed', 'wait', 'active', 'completed', 'failed']
            .map(x => this.queue.clean(0, x)));
        const jobs = await this.queue.getRepeatableJobs();
        await Promise.all(jobs.map(j => this.queue.removeRepeatableByKey(j.key)));
    }

    async addTask(task) {
        const {id, name, cron_string} = task;
        console.log(cron_string)
        await this.queue.add(
            {id, name, type: 'task'},
            {
                repeat: { cron: cron_string }
            }
        );
    }

    async getTaskCount() {
        return this.queue.getRepeatableCount();
    }

    async getJobs() {
        return this.queue.getRepeatableJobs();
    }

    async addEvent(event) {
        const {id, name, cron_string} = event;
        await this.queue.add(
            {id, name, type: 'event'},
            {
                repeat: { cron: cron_string },
                removeOnComplete: true
            }
        )
    }

    async rebuildQueue(tasks) {
        await this.clean();
        return Promise.all(tasks.map(t => this.addTask(t)));
    }
}

module.exports = TaskQueue;