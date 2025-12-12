const TaskScheduler = require('./TaskScheduler');

describe('TaskScheduler', () => {
  let scheduler;

  beforeEach(() => {
    scheduler = new TaskScheduler();
  });

  afterEach(() => {
    scheduler.shutdown();
  });

  it('should schedule a task', () => {
    const fn = jest.fn();
    scheduler.schedule('test-task', fn, 5000);
    
    const task = scheduler.getTask('test-task');
    expect(task).toBeDefined();
    expect(task.id).toBe('test-task');
    expect(task.interval).toBe(5000);
    expect(task.enabled).toBe(true);
  });

  it('should unschedule a task', () => {
    scheduler.schedule('test-task', jest.fn(), 5000);
    scheduler.unschedule('test-task');
    
    expect(scheduler.getTask('test-task')).toBeUndefined();
  });

  it('should enable/disable a task', () => {
    scheduler.schedule('test-task', jest.fn(), 5000);
    
    scheduler.setTaskEnabled('test-task', false);
    expect(scheduler.getTask('test-task').enabled).toBe(false);
    
    scheduler.setTaskEnabled('test-task', true);
    expect(scheduler.getTask('test-task').enabled).toBe(true);
  });

  it('should get all tasks', () => {
    scheduler.schedule('task-1', jest.fn(), 5000);
    scheduler.schedule('task-2', jest.fn(), 10000);
    
    const tasks = scheduler.getAllTasks();
    expect(tasks).toHaveLength(2);
  });

  it('should return stats', () => {
    scheduler.schedule('task-1', jest.fn(), 5000);
    scheduler.schedule('task-2', jest.fn(), 10000);
    scheduler.setTaskEnabled('task-2', false);
    
    const stats = scheduler.getStats();
    expect(stats.totalTasks).toBe(2);
    expect(stats.enabledTasks).toBe(1);
    expect(stats.averageInterval).toBe(7500);
  });

  it('should shutdown and clear all tasks', () => {
    scheduler.schedule('task-1', jest.fn(), 5000);
    scheduler.schedule('task-2', jest.fn(), 10000);
    
    scheduler.shutdown();
    
    expect(scheduler.getAllTasks()).toHaveLength(0);
  });

  it('should replace existing task with same ID', () => {
    const fn1 = jest.fn();
    const fn2 = jest.fn();
    
    scheduler.schedule('task', fn1, 5000);
    scheduler.schedule('task', fn2, 10000);
    
    const tasks = scheduler.getAllTasks();
    expect(tasks).toHaveLength(1);
    expect(tasks[0].interval).toBe(10000);
  });

  it('should get singleton instance', () => {
    const instance1 = TaskScheduler.getInstance();
    const instance2 = TaskScheduler.getInstance();
    expect(instance1).toBe(instance2);
  });
});
