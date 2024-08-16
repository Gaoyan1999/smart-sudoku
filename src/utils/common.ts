export function classNames(classObject: Record<string, boolean>) {
  const classNamesArray: string[] = [];

  // traverse the keys of object
  for (const className in classObject) {
    // If true，put the key to classNamesArray
    if (classObject[className]) {
      classNamesArray.push(className);
    }
  }
  return " " + classNamesArray.join(" ") + " ";
}

export function secondToHourAndMinutes(val: number) {
  function fixZeroStart(val: number) {
    return val.toString().padStart(2);
  }
  const second = val % 60;
  let minutes = Math.floor(val / 60);
  const hours = Math.floor(minutes / 60);
  minutes = minutes % 60;
  const minutesAndSecondStr =
    fixZeroStart(minutes) + ":" + fixZeroStart(second);
  return hours > 0
    ? fixZeroStart(hours) + ":" + minutesAndSecondStr
    : minutesAndSecondStr;
}
