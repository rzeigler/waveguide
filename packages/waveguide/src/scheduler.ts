export interface Scheduler {
  after(millis: number, action: () => void): number;
  cancel(handle: number): void;
}

class SetTimeoutScheduler implements Scheduler {
  public after(millis: number, action: () => void): number {
    return setTimeout(() => {
      action();
    }, millis);
  }
  public cancel(handle: number): void {
    clearTimeout(handle);
  }
}

export default new SetTimeoutScheduler();

export class ManualScheduler implements Scheduler {
  private next: number = 0;
  private current: number = 0;
  private queued: Array<[number, number, () => void]> = [];

  public after(millis: number, action: () => void): number {
    const id = this.next++;
    this.queued.push([id, this.current + millis, action]);
    return id;
  }

  public cancel(handle: number): void {
    this.queued = this.queued.filter((block) => block[0] !== handle);
  }

  public tick(millis: number): void {
    this.current += millis;
    const outstanding = this.queued.filter((block) => block[1] <= this.current);
    this.queued = this.queued.filter((block) => block[1] > this.current);
    outstanding.forEach((block) => block[2]());
  }
}
