#!/usr/bin/env zx
// Main
const home = await os.homedir();
//----------------- setup -------------------

async function setup() {
  await fs.ensureDir(`${home}/.config/wka`);
  await fs.ensureFile(`${home}/.config/wka/data.json`);
  await fs.ensureFile(`${home}/.config/wka/.alias`);

  const data = {
    name: "wka",
    version: "1.0.0",
    description: "wka is a simple alias manager",
    keywords: ["alias", "manager", "cli"],
    author: "sadkodev",
    year: new Date().getFullYear(),
  };

  await fs.writeJson(`${home}/.config/wka/data.json`, data);
  await fs.writeFile(`${home}/.config/wka/.alias`, ``);
}

if (
  !fs.existsSync(
    `${home}/.config/wka` &&
      `${home}/.config/wka/data.json` &&
      `${home}/.config/wka/.alias`,
  )
) {
  setup();
}

//----------------- data -------------------
async function getData() {
  return fs.readJson(`${home}/.config/wka/data.json`);
}

const data = await getData();
const pathAliasTmp = `${home}/.config/wka/.alias`;
const aliasFiles = await fs.readFile(pathAliasTmp, "utf-8");
const args = process.argv.slice(3);

//----------------- actions -------------------

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
  {
    label: "root",
    prefix: "rt",
    path: "/",
    category: "important",
  },
  {
    label: "testing",
    prefix: "ts",
    path: `${home}/testing`,
    category: "testing",
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
      echo`\t${action.args.join(" ")}\n\t${chalk.dim(action.description)}\n`;
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
    parseStylesData(`Please add new alias 🔥\n ${data.name} -a -add alias`, {
      color: "red",
      bold: false,
    });
    return;
  } else {
    let directPath = await $`pwd`;
    let parsePath = directPath.stdout.trim().split("/").slice(0, -1).join("/");
    let prefix = generalPaths
      .filter((path) => path.path === parsePath)
      .map((path) => path.prefix);

    let output = `alias ${prefix}-${alias[0]}='${directPath.stdout.trim()}'\n`;
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

async function remove() {
  let alias = process.argv.slice(4);
  if (alias.length === 0) {
    parseStylesData(
      `Please provide valid alias to remove 🔥\n ${data.name} -r --remove alias`,
      {
        color: "red",
        bold: false,
      },
    );
    return;
  } else {
    parseStylesData(`Alias removed 🤬 ${alias}`, {
      color: "green",
      bold: false,
    });
    let aliasFiles = await fs.readFile(pathAliasTmp, "utf-8");
    if (aliasFiles.includes(alias)) {
      let newAlias = aliasFiles.replace(alias, "");
      await fs.writeFile(pathAliasTmp, newAlias);
    } else {
      parseStylesData(notify("noAlias"), {
        color: "red",
        bold: false,
      });
    }
  }
}

function edit() {
  let alias = process.argv.slice(4);
  if (alias.length === 0) {
    parseStylesData(
      `Please provide valid alias to edit 🔥\n ${data.name} -e --edit alias`,
      {
        color: "red",
        bold: false,
      },
    );
    return;
  } else {
    list();
  }
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

//TODO: create a function to send msg to user when something goes wrong and provide the exact examples to used the command
function notify(situation) {
  if (situation === "noDep") {
    return `please install dependencies to run this command \n | npm install zx | \n | yarn add zx | \n`;
  }
  if (situation === "noAlias") {
    return `No alias found, please add new alias \n  ${
      data.name
    } ${chalk.underline.cyan(`-a --add alias`)} \n`;
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

async function run() {
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
    parseStylesData(error, {
      color: "red",
      bold: true,
    });
  }
}

run();
