// common utility functions for objects

// generate deep path to inputKey in inputObj if inputKey exists. modified from
// https://www.techighness.com/post/javascript-find-key-path-in-deeply-nested-object-or-array/
function findNestedObjectPath(
  inputObj: unknown,
  inputKey: string,
  predicate: (key: string, value: unknown) => boolean
) {
  const path: string[] = [];

  function keyExists(obj: unknown, key: string): boolean {
    if (!obj || (typeof obj !== 'object' && !Array.isArray(obj))) {
      return false;
    } else if (
      Object.prototype.hasOwnProperty.call(obj, key) &&
      predicate(key, (obj as Record<string, unknown>)[key])
    ) {
      path.push(key);
      return true;
    } else if (Array.isArray(obj)) {
      const parentKey = path.length ? path.pop() : '';

      for (let i = 0; i < obj.length; i++) {
        path.push(`${parentKey}[${i}]`);
        const result = keyExists(obj[i], key);
        if (result) {
          return result;
        }
        path.pop();
      }
    } else {
      for (const k in obj) {
        path.push(k);
        const result = keyExists((obj as Record<string, unknown>)[k], key);
        if (result) {
          return result;
        }
        path.pop();
      }
    }
    return false;
  }

  keyExists(inputObj, inputKey);

  return path;
}

// find all deep inputKeys in inputObj that match predicate
// then for each match, apply transform function to mutate original inputObj
export function applyTransformToNestedObjectProperties(
  inputObj: Record<string, unknown>,
  inputKey: string,
  predicate: (key: string, value: unknown) => boolean,
  transform: (obj: unknown) => unknown
) {
  let curObj = inputObj;

  // find all matching occurrences of inputKey matching predicate
  let res = findNestedObjectPath(inputObj, inputKey, predicate);
  while (res.length) {
    // for a match, access correct property and apply transform fn
    for (let i = 0; i < res.length; i += 1) {
      const pieces = res[i].split('[');

      if (!(pieces[0] in curObj)) {
        throw new Error(`object property ${pieces[0]} not in input object`);
      }

      if (i === res.length - 1) {
        curObj[pieces[0]] = transform(curObj[pieces[0]]);
      } else {
        curObj = curObj[pieces[0]] as Record<string, unknown>;
        if (pieces.length === 2) {
          const idx = Number(pieces[1].replace(']', ''));
          curObj = curObj[idx] as Record<string, unknown>;
        }
      }
    }

    res = findNestedObjectPath(inputObj, inputKey, predicate);
  }
}
