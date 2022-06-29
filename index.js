import fs from "fs";
import path from "path";
import mkdirp from "mkdirp";
import camelcase from "camelcase";

export default async () => {
  const root = path.join(process.cwd(), "events");
  mkdirp.sync(root);

  const ignore = path.join(root, ".gitignore");
  fs.stat(ignore, function (err, stat) {
    if (stat && stat.isFile()) {
      console.log(`${ignore}存在`);
    } else {
      fs.writeFileSync(ignore, "/index.js");
    }
  });

  const lib = path.join(root, "lib");
  mkdirp.sync(lib);

  const application = path.join(lib, "application.js");
  fs.stat(application, function (err, stat) {
    if (stat && stat.isFile()) {
      console.log(`${application}存在`);
    } else {
      fs.writeFileSync(application, "export default ['didFinishLaunching']");
    }
  });

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

  const index = path.join(root, "index.js");
  fs.writeFileSync(
    index,
    'import EventEmitter from "events"; export const emitter = new EventEmitter(); export default ' +
      json
  );
};
