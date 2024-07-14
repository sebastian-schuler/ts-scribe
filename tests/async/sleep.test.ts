import { sleep } from '../../src/async';

describe('sleep', () => {
  it('sleep waits the specified amount of time', async () => {
    const startTime = new Date().getTime();
    const sleepTime = 1000 * 3;
    await sleep(sleepTime);

    const endTime = new Date().getTime();
    expect(endTime - startTime >= sleepTime).toBe(true);
  });
});
