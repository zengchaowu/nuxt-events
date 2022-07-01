import fs from "fs";
import path from "path";
import mkdirp from "@doraemon-module/nuxt-functions/lib/mkdirp";
import camelcase from "camelcase";

export default async () => {
  const events = mkdirp(path.join(process.cwd(), "events"));
  const lib = mkdirp(path.join(events, "lib"));

  const files = fs.readdirSync(lib);
  const out = {};
  for (const file of files) {
    const list = await import(path.join(lib, file));
    const dic = {};
    list.default.forEach((item) => {
      dic["$" + camelcase(item, { pascalCase: true }) + "$"] = path.join(
        path.parse(file).name,
        item
      );
    });
    out["$" + camelcase(path.parse(file).name, { pascalCase: true }) + "$"] =
      dic;
  }
  let json = JSON.stringify(out);
  json = json.replaceAll('$"', "");
  json = json.replaceAll('"$', "");

  const index = path.join(events, "index.js");
  fs.writeFileSync(
    index,
    'import EventEmitter from "events"; export const emitter = new EventEmitter(); export default ' +
      json
  );
};
