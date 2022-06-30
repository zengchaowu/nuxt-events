#!/usr/bin/env node
import ts from "typescript";
import write from "@doraemon-module/nuxt-functions/lib/write.js";

write(undefined, undefined, "buildModules", (node) => {
  const name = "@doraemon-module/nuxt-events";
  let isExist = false;
  for (let element of node.elements) {
    if (element.text === name) {
      isExist = true;
      break;
    }
  }
  if (!isExist) {
    node.elements.push(ts.createStringLiteral(name));
  }
});
