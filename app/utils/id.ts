export const id2path = (id = ""): string =>
  id
    .replace(/^G/, "guide/")
    .replace(/^I/, "intro/")
    .replace(/^O/, "other/")
    .replace(/\/$/, "/index");

export const path2id = (path = ""): string =>
  path
    .replace(/^guide\//, "G")
    .replace(/^intro\//, "I")
    .replace(/^other\//, "O")
    .replace(/\/index$/, "/");
