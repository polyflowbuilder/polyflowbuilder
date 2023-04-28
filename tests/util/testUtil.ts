// general test utilities that don't belong in any one category

// see https://stackoverflow.com/a/4460624
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cloneAndDeleteNestedProperty(item: any, property: string) {
  if (!item) {
    return item;
  } // null, undefined values check

  const types = [Number, String, Boolean];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any;

  // normalizing primitives if someone did new String('aaa'), or new Number('444');
  types.forEach(function (type) {
    if (item instanceof type) {
      result = type(item);
    }
  });

  if (typeof result == 'undefined') {
    if (Object.prototype.toString.call(item) === '[object Array]') {
      result = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (item as any[]).forEach(function (child, index) {
        result[index] = cloneAndDeleteNestedProperty(child, property);
      });
    } else if (typeof item == 'object') {
      // testing that this is DOM
      if ('nodeType' in item && 'cloneNode' in item && typeof item.cloneNode == 'function') {
        result = item.cloneNode(true);
      } else if (!('prototype' in item)) {
        // check that this is a literal
        if (item instanceof Date) {
          result = new Date(item);
        } else {
          // it is an object literal
          result = {};
          for (const i in item) {
            if (i !== property) {
              result[i] = cloneAndDeleteNestedProperty(item[i], property);
            }
          }
        }
      } else {
        // // depending what you would like here,
        // // just keep the reference, or create new object
        // if (false && item.constructor) {
        //   // would not advice to do that, reason? Read below
        //   result = new item.constructor();
        // } else {
        //   result = item;
        // }
      }
    } else {
      result = item;
    }
  }

  return result;
}
