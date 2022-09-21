Neptune scheduler, for very flexible time management in one web interface!

Calendar: because sometimes you have to change life up a lot, and it sucks to delete and re-create things. Calendars allow for the ability to switch the entirety of what's in the to-do

Task Chains: because sometimes tasks can't really be attached to a specific time, but rather will float depending on other things. This is usually a set of tasks done one after the other. So let's create the ability to have floating task chains. We need to know whether these are daily, weekly, or monthly. The head task on the chain can have a suggested start time, but it's
not solid like usual. (On the GUI side of things it might be represented with a different background color or such.)
- add a chain id to the task
- create a chain table that has the id and whether it's daily/weekly/monthly
- create a chain_day table that has the id and the days the chain exists
- create a chain tasks_table that has the chain id, task id, and next_task id. the call to get these will order them as appropriate

Queue of things to work on:
- Subtasking: but this is really more of a front-end thing. And we've demonstrated it works. So DONE?
- Task chaining
- Adding events to queue (DONE)
- Handling when new tasks overlap existing ones (DONE)
    - So for this, we can get all the tasks for the given day, convert their start to minutes, and add duration to get end time, then return a list of tasks whose start or end fall in the proposed task, and tasks who the proposed task fall within
- Handling when an event overlaps existing tasks/events
- Moving tasks to a later time
    - Need a concept of moved_tasks, which creates a daily task of the original task. When the cron for the original task runs, check if it has a moved_task for this day, and if so, don't send the socket message to the front end
    - todo: make this support task chains
- intelligently seeking where to put a task. would need to find a free time slot within the given day, or opt to just delete that day's iteration, or move the task to another day
- intelligently bumping tasks down. iterative process of moving them ahead
    - need a concept of 'working hours' within a day, that way something doesn't get pushed to 11 pm