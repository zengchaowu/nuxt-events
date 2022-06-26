import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import camelcase from "camelcase";

export default async () => {
  const root = path.join(process.cwd(), "events");
  mkdirp.sync(root);
  const index = path.join(root, "index.js");
  const ignore = path.join(root, ".gitignore");
  fs.writeFileSync(ignore, "/index.js");
  const lib = path.join(root, "lib");
  mkdirp.sync(lib);
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
  fs.writeFileSync(
    index,
    'import EventEmitter from "events"; export const emitter = new EventEmitter(); export default ' +
      json
  );
};
