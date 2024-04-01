import { rfdc } from './rfdc';

type Options = {
  circleRefs?: boolean;
  protoProps?: boolean;
};

/**
 * Deep clone an object.
 * @param obj - The object to clone.
 * @param options - The options for deep cloning. (Optional)
 *  - circleRefs: Whether to maintain circular references. (Default: false)
 *  - protoProps: Whether to clone prototype properties. (Default: false)
 * @returns A deep clone of the object.
 */
export function deepClone<T>(obj: T, options?: Options): T {
  return rfdc({
    circles: options?.circleRefs ?? false,
    proto: options?.protoProps ?? false,
  })(obj);
}
