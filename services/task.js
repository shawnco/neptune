const Task = require('./../models/task');
const TaskDay = require('./../models/task_day');
const {isNil, range} = require('lodash');

module.exports = {
    async getAll() {
        return Task.findAll();
    },

    async get(id) {
        return Task.findByPk(id);
    },

    async create(data) {
        return Task.create(data);
    },

    async update(id, data) {
        const task = await Task.findByPk(id);
        task.name = data.name || task.name;
        task.completed = !isNil(data.completed) ? data.completed : task.completed;
        task.calendar = data.calendar || task.calendar;
        task.cron_string = data.cron_string || task.cron_string;
        task.chain = data.chain || task.chain;
        task.parent = data.parent || task.parent;
        task.duration = data.duration || task.duration;
        return task.save();
    },

    async delete(id) {
        return Task.destroy({where:{id}});
    },

    async getCronTaskByCalendar(id) {
        return Task.findAll({
            where: {
                calendar: id
            }
        });
    },

    // given a cron string and duration, get the start and end
    // times for an event
    calculateStartEnd(cron, duration) {
        const [min, hour, ...rest] = cron.split(' ');
        const minInt = +min;
        const hourInt = +hour;
        const start = hourInt * 60 + minInt;
        const end = start + duration;
        return {start, end};
    },

    async getDailyTasks(calendar = null) {
        const where = {
            frequency: 'daily'
        };
        if (calendar) {
            where.calendar = calendar;
        }
        return Task.findAll({where});
    },

    async getWeeklyTasks(day, calendar = null) {
        const taskDay = await TaskDay.findAll({
            where: {
                day
            }
        });
        const taskIds = taskDay.map(t => t.task);
        const where = {
            frequency: 'weekly',
            id: taskIds
        };
        if (calendar) {
            where.calendar = calendar;
        }
        return Task.findAll({where});
    },

    async getMonthlyTasks(day, calendar = null) {
        const taskDay = await TaskDay.findAll({where:{day}});
        const taskIds = taskDay.map(t => t.task);
        const where = {
            frequency: 'monthly',
            id: taskIds
        };
        if (calendar) {
            where.calendar = calendar;
        }
        return Task.findAll({where});
    },

    // fn to determine if overlap exists
    checkOverlap(newTask, existingTask) {
        const newTimes = this.calculateStartEnd(newTask.cron_string, newTask.duration);
        const existingTimes = this.calculateStartEnd(existingTask.cron_string, existingTask.duration);
        // overlap exists if:
        // 1. new task STARTS within existing task
        // 2. new task ENDS within existing task
        // 3. new task STARTS and ENDS before/after existing task

        if (newTimes.start >= existingTimes.start && newTimes.start <= existingTimes.end) {
            return {overlap: true, reason: 'START'};
        } else if (newTimes.end >= existingTimes.start && newTimes.end <= existingTimes.end) {
            return {overlap: true, reason: 'END'};
        } else if (newTimes.start <= existingTimes.start && newTimes.end >= existingTimes.end) {
            return {overlap: true, reason: 'ENVELOP'};
        } else {
            return {overlap: false, reason: 'NONE'};
        }
    },

    // fn to run through all the possible overlaps
    checkOverlaps(newTask, existingTasks) {
        return existingTasks.filter(e => this.checkOverlap(newTask, e));
    },

    // fn to convert date ranges to their respective weeks and months
    datesToDays(start, end) {
        const startDay = start.getDay();
        const endDay = end.getDay();
        if (startDay === endDay) {
            return [startDay];
        } else if (startDay < endDay) {
            return range(startDay, endDay + 1);
        } else {
            return [...range(startDay, 7), ...range(0, endDay + 1)];
        }
    },

    datesToMonths(start, end) {
        const startMonth = start.getDate();
        const endMonth = end.getDate();
        if (startMonth === endMonth) {
            return [startMonth];
        } else if (startMonth < endMonth) {
            return range(startMonth, endMonth + 1);
        } else {
            return [...range(startMonth, 32), ...range(1, endMonth + 1)];
        }
    },

    // for the sake of consistency, let's pass
    // ${now} as minutes
    findFreeTime(tasks, activeHours, now, newTask) {
        const {duration} = newTask;
        // first we need to find all the free spots in the remaining day.
        // we do this by converting the tasks to their start/end times.
        let taskTimes = tasks.map(t => this.calculateStartEnd(t.cron_string, t.duration));
        // discard tasks who end before the start of active hours
        taskTimes = taskTimes.filter(t => t.end >= activeHours.start);
        // discard tasks who start after the end of active hours
        taskTimes = taskTimes.filter(t => t.start <= activeHours.end);
        // discard tasks who end before now
        taskTimes = taskTimes.filter(t => t.end >= now);
        // now we need to build our gaps
        // sort tasks by start time
        taskTimes.sort((a, b) => a.start - b.start);
        // init the array of gaps
        const gaps = [];

        // find whether now or start of active hours is more recent
        const start = now > activeHours.start ? now : activeHours.start;

        // if there's no tasks between now and end of the day, then just return now
        // to the duration. unless the active hours end within the duration, then return
        // the -1, -1 result
        if (taskTimes.length === 0) {
            if (start + duration <= activeHours.end) {
                return {start, end: start + duration};
            } else {
                return {start: -1, end: -1};
            }
        }
        
        // if the first task starts before active hours, then the first gap is
        // from that task's end to the start of the next task. otherwise the first
        // gap is from the start of active hours to the start of the next task
        if (taskTimes[0].start > start) {
            gaps.push({start: start, end: taskTimes[0].start});
        }

        // then we loop through the tasks, creating the gaps from the end of one
        // and the start of the next
        let i = 0;
        while (i < taskTimes.length - 1) {
            gaps.push({start: taskTimes[i].end, end: taskTimes[i].start});
            i++;
        }

        // if the final task ends after active hours, then the last gap is from the
        // previous task's end to the start of the final task. otherwise the final
        // gap is from the end of the last task, to the end of active hours
        if (taskTimes[taskTimes.length - 1].end < activeHours.end) {
            gaps.push({start: taskTimes[taskTimes.length -1].end, end: activeHours.end});
        }


        // finally we filter out all gaps that are too small, and return the 
        // first one. if no gap is found then this will return [-1, -1]
        const eligibleGaps = gaps.filter(g => g.end - g.start >= duration);
        if (eligibleGaps.length) {
            return eligibleGaps[0];
        } else {
            return {start: -1, end: -1};
        }
    }
    
}