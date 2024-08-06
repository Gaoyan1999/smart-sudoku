export function classNames(classObject: Record<string, boolean>) {
  const classNamesArray: string[] = [];

  // 遍历对象的键
  for (const className in classObject) {
    // 如果对象的值为 true，则将键添加到 classNamesArray 数组中
    if (classObject[className]) {
      classNamesArray.push(className);
    }
  }

  // 使用 join 方法将数组转换成一个以空格分隔的字符串
  return " " + classNamesArray.join(" ") + " ";
}
