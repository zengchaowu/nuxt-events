import fs from "fs";
import path from "path";
import copy from "@doraemon-module/nuxt-functions/lib/copy";
import mkdirp from "@doraemon-module/nuxt-functions/lib/mkdirp";
import write from "@doraemon-module/nuxt-functions/lib/write";
import { dirname } from "path";
import { fileURLToPath } from "url";
import camelcase from "camelcase";

export default async () => {
  const __dirname = dirname(fileURLToPath(import.meta.url));

  const events = mkdirp(path.join(process.cwd(), "events"));
  copy(
    path.join(__dirname, "lib", "_gitignore"),
    path.join(events, ".gitignore")
  );

  const lib = mkdirp(path.join(events, "lib"));
  copy(
    path.join(__dirname, "lib", "application.js"),
    path.join(lib, "application.js")
  );

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

  write();
};
