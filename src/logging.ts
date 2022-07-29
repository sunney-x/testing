import chalk from "chalk";

const _space = `    `;
const msg = (text: string) => `${_space}${text}${_space}`;
const log = {
  blue: (text: string) => console.log(chalk.bgBlueBright(msg(text))),
  green: (text: string) => console.log(chalk.bgGreenBright(msg(text))),
  red: (text: string) => console.log(chalk.bgRedBright(msg(text))),
};

export default log;
