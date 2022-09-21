const Chain = require('./../models/chain');
const ChainDay = require('./../models/chain_day');
const ChainTask = require('./../models/chain_task');
const Task = require('./../models/task');
const {Op} = require('sequelize').Sequelize;

module.exports = {
    orderChainTasks(task) {
        const output = [];
        let last = tasks.find(t => t.next_task == null);
        while (last !== undefined) {
            output.push(last);
            last = tasks.find(t => t.next_task == last.task);
        }
        return last.reverse();
    },

    async getChainTasks(id) {
        const chainTasks = ChainTask.findAll({
            where: {
                chain: id
            }
        });
        // let's flesh out the details of each task
        // on the chain, but leave the next_task as
        // just a pointer
        for (let i = 0; i < chainTasks.length; i++) {
            chainTasks[i].task_data = await Task.findByPk(chainTasks[i].task);
        }
        return chainTasks;
    },

    async getDailyChains() {
        const chains = await Chain.findAll({
            where: {
                frequency: 'daily'
            }
        });
        for (let i = 0; i < chains[i]; i++) {
            chains[i].tasks = await this.getChainTasks(chains[i].id);
        }
        return chains;
    },

    async getWeeklyChains(day) {
        // get the ids of all chains on this weekday
        const chainDays = await ChainDay.findAll({
            where: {
                day
            }
        });
        const chainIds = chainDays.map(cd => cd.chain);
        // get chains who use this weekday that
        // are also weekly
        const chains = await Chain.findAll({
            where: {
                frequency: 'weekly',
                id: chainIds
            }
        });
        for (let i = 0; i < chains[i]; i++) {
            chains[i].tasks = await this.getChainTasks(chains[i].id);
        }
    },

    async getMonthlyChains(day) {
        // get the ids of all chains on this weekday
        const chainDays = await ChainDay.findAll({
            where: {
                day
            }
        });
        const chainIds = chainDays.map(cd => cd.chain);
        // get chains who use this weekday that
        // are also monthly
        const chains = await Chain.findAll({
            where: {
                frequency: 'monthly',
                id: chainIds
            }
        });
        for (let i = 0; i < chains[i]; i++) {
            chains[i].tasks = await this.getChainTasks(chains[i].id);
        }

    },

    // adding and removing tasks from chains
    async addToChain(task, parentTask) {
        // get the chain the parent task belongs to
        const parent = await Task.findByPk(parentTask);
        // what if the parent isn't part of a chain? then
        // we need to create one. 
    }
}