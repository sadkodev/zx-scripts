#!/usr/bin/env zx
// Main
const data = await fs.readJson("./package.json");
const pathAliasTmp = "./.aliasTemporary_history";
const aliasFiles = await fs.readFile(pathAliasTmp, "utf-8");
const home = await os.homedir();
const args = process.argv.slice(3);

const actions = [
  {
    label: "help",
    args: ["--help", "-h"],
    action: help,
    description: "Show help",
  },
  {
    label: "version",
    args: ["--version", "-v"],
    action: version,
    description: "Show version",
  },
  {
    label: "list",
    args: ["--list", "-l"],
    action: list,
    description: "List of alias",
  },
  {
    label: "add",
    args: ["--add", "-a"],
    action: add,
    description: "Add new alias",
  },
  {
    label: "remove",
    args: ["--remove", "-r"],
    action: remove,
    description: "Remove alias",
  },
  {
    label: "edit",
    args: ["--edit", "-e"],
    action: edit,
    description: "Edit alias",
  },
  {
    label: "category",
    args: ["--category", "-c"],
    action: category,
    description: "List of category",
  },
  {
    label: "setup",
    args: ["--setup", "-s"],
    action: setup,
    description: "Setup new file",
  },
  {
    label: "test",
    args: ["--test", "-t"],
    action: test,
    description: "Test",
  },
];

const generalPaths = [
  {
    label: "workspace",
    prefix: "wk",
    path: `${home}/Workspace`,
    category: "work",
  },
  {
    label: "projects",
    prefix: "pr",
    path: `${home}/Projects`,
    category: "work",
  },
  {
    label: "downloads",
    prefix: "dl",
    path: `${home}/Downloads`,
    category: "tools",
  },
  {
    label: "documents",
    prefix: "dc",
    path: `${home}/Documents`,
    category: "research",
  },
  {
    label: "pictures",
    prefix: "pc",
    path: `${home}/Pictures`,
    category: "research",
  },
  {
    label: "videos",
    prefix: "vd",
    path: `${home}/Videos`,
    category: "research",
  },
  {
    label: "music",
    prefix: "mu",
    path: `${home}/Music`,
    category: "research",
  },
  {
    label: "desktop",
    prefix: "dt",
    path: `${home}/Desktop`,
    category: "research",
  },
  {
    label: "home",
    prefix: "hm",
    path: `${home}`,
    category: "research",
  },
];

//----------------- actions -------------------
function help() {
  layout(() => {
    parseStylesData("Options:\n", {
      color: "white",
      bold: true,
    });
    for (let action of actions) {
      echo` ${action.args.join(" ")} => ${action.description}\n`;
    }
    parseStylesData("Examples:\n", {
      color: "white",
      bold: true,
    });
    echo` ${data.name} --list or -l \n`;
  }, false);
}

function version() {
  layout(() => {
    parseStylesData(`CLI ${data.name}: ${data.version}`, {
      color: "blue",
      bold: false,
    });
  });
}

function list() {
  layout(() => {
    let output = ``;
    const aliasList = aliasFiles.split("\n").filter((alias) => alias);
    const aliasNames = [];
    const aliasPaths = [];

    if (aliasList.length === 0) {
      parseStylesData(notify("noAlias"), {
        color: "red",
        bold: false,
      });
      return;
    }
    parseStylesData("List of alias:\n", {
      color: "green",
      bold: true,
    });
    for (let alias of aliasList) {
      const splitAlias = alias.split("=");
      aliasNames.push(splitAlias[0]);
      aliasPaths.push(splitAlias[1]);
    }

    output = aliasNames.map((name, index) => {
      let path = aliasPaths[index];
      return `${index + 1}. ${name.slice(6, name.length)} -> ${path}\n`;
    });

    parseStylesData(output.join(""), {
      color: "white",
      bold: true,
    });
  }, false);
}

function category() {}

async function add() {
  let alias = process.argv.slice(4);
  if (alias.length === 0) {
    parseStylesData("Please add new alias 👍", {
      color: "red",
      bold: false,
    });
    return;
  } else {
    let directPath = await $`pwd`;
    let directPathArr = directPath.toString().split("/")[3];
    let newAlias = generalPaths.filter((item) => item.path === directPathArr && item);
    test(directPathArr);
    test(newAlias);

    let output = `alias ${alias[0]}='${directPath.stdout.trim()}'\n`;
    if (aliasFiles.includes(output)) {
      parseStylesData("Alias already exist 👍", {
        color: "red",
        bold: false,
      });
      return;
    } else {
      await fs.appendFile(pathAliasTmp, output);
    }
  }
}

function remove(params) {}

function edit(params) {}

function setup() {
  test();
}

//----------------- utils -------------------
function parseStylesData(output, { color, bold = false }) {
  if (!bold) {
    echo(chalk[color](output));
  } else {
    echo(chalk.bold[color](output));
  }
}

function parseMsg(msg) {
  return ` ${msg}\n`;
}

function separator(color = "gray") {
  return parseStylesData("------------------------------------------------", {
    color,
    bold: true,
  });
}

function footer() {
  separator();
  parseStylesData(`CopyRight © ${data.year} ${data.author}`, {
    color: "gray",
    bold: false,
  });
}

function header(title = true) {
  if (!title) {
    parseStylesData(`\nUsage: ${data.name} [options]`, {
      color: "magenta",
      bold: true,
    });
    separator();
  } else {
    separator();
  }
}

function layout(children, title = true) {
  header(title);
  children();
  footer();
}

function notify(situation) {
  if (situation === "noDep") {
    return `please install dependencies to run this command \n | npm install zx | \n | yarn add zx | \n`;
  }
  if (situation === "noAlias") {
    return `No alias found, please add new alias \n | ${data.name} --add | \n`;
  }

  if (situation === "noCategory") {
    return `No category found, please add new category \n | ${data.name} --category | \n`;
  }

  if (situation === "noArgs") {
    return `Please provide valid arguments \n | ${data.name} --help | \n`;
  }

  if (situation === "noFile") {
    return `No file found \n | ${data.name} --setup | \n`;
  }

  return `Please provide valid arguments`;
}

//----------------- test -------------------
function test(msg) {
  separator("red");
  parseStylesData(`output: ${msg}`, {
    color: "red",
    bold: true,
  });
  separator("red");
}

function run() {
  try {
    if (args.length === 0) {
      help();
      return;
    }
    for (let action of actions) {
      if (args.some((arg) => action.args.includes(arg))) {
        action.action();
        return;
      }
    }
    help();
  } catch (error) {
    echo(error);
  }
}

run();
