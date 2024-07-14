type Task<T> = (callback: (error: Error | null, result?: T) => void) => void;

/**
 * Runs the tasks array of functions in series, each passing their results to the next in the array.
 * @param tasks - functions to run
 * @returns - final result
 */
export function waterfall<T>(tasks: Task<T>[]): Promise<T> {
  return tasks.reduce((prevTask, currentTask) => {
    return prevTask.then(currentTask);
  }, Promise.resolve() as Promise<any>);
}
