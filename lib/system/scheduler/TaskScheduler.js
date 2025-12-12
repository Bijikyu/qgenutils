/**
 * Centralized task scheduler to consolidate multiple setInterval instances.
 *
 * PURPOSE: Reduces CPU contention from numerous independent timers by using
 * a single tick loop that manages all scheduled tasks. Provides unified
 * timing, cleanup mechanisms, and performance statistics.
 *
 * SINGLETON PATTERN: Use TaskScheduler.getInstance() for shared scheduler.
 */

class TaskScheduler {
  constructor() {
    this.tasks = new Map();
    this.timer = null;
    this.tickInterval = 1000;
  }

  static getInstance() {
    if (!TaskScheduler.instance) {
      TaskScheduler.instance = new TaskScheduler();
    }
    return TaskScheduler.instance;
  }

  schedule(id, fn, interval) {
    this.unschedule(id);
    
    const task = {
      id,
      fn,
      interval,
      lastRun: 0,
      enabled: true
    };
    
    this.tasks.set(id, task);
    this.startTimer();
  }

  unschedule(id) {
    this.tasks.delete(id);
    
    if (this.tasks.size === 0 && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  setTaskEnabled(id, enabled) {
    const task = this.tasks.get(id);
    if (task) {
      task.enabled = enabled;
    }
  }

  getTask(id) {
    return this.tasks.get(id);
  }

  getAllTasks() {
    return Array.from(this.tasks.values());
  }

  shutdown() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.tasks.clear();
  }

  startTimer() {
    if (this.timer) return;
    
    this.timer = setInterval(() => {
      this.tick();
    }, this.tickInterval);
  }

  async tick() {
    const now = Date.now();
    
    for (const task of this.tasks.values()) {
      if (!task.enabled) continue;
      
      const timeSinceLastRun = now - task.lastRun;
      if (timeSinceLastRun >= task.interval) {
        try {
          await Promise.resolve(task.fn());
          task.lastRun = now;
        } catch (error) {
          console.error(`Task ${task.id} failed:`, error);
        }
      }
    }
  }

  getStats() {
    const tasks = Array.from(this.tasks.values());
    const enabledTasks = tasks.filter(t => t.enabled);
    const averageInterval = tasks.length > 0
      ? tasks.reduce((sum, t) => sum + t.interval, 0) / tasks.length
      : 0;
    
    return {
      totalTasks: tasks.length,
      enabledTasks: enabledTasks.length,
      averageInterval
    };
  }
}

TaskScheduler.instance = null;

module.exports = TaskScheduler;
