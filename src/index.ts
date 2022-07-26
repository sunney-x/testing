import chalk from "chalk";
import EventEmitter from "events";

type Test = {
  name: string;
  wait: boolean;
  fn: It;
};

type TGroups = {
  [group: string]: Test[];
};

const groups: TGroups = {};

type It = () => Promise<void>;
type InnerFunctionType = (name: string, it: It) => void;
type FunctionType = (fn: InnerFunctionType) => void;

export function test(group: string, fn: FunctionType, wait: boolean = false) {
  if (!groups[group]) {
    groups[group] = [];
  }

  fn((name, fn) =>
    groups[group].push({
      name,
      fn,
      wait: false,
    })
  );

  return {
    sync: () => {
      groups[group] = groups[group].map((it) => ({
        ...it,
        wait: true,
      }));
    },
  };
}

async function runGroups(groups: TGroups, emitter: EventEmitter) {
  for (const [group, tests] of Object.entries(groups)) {
    console.log(chalk.bgGreenBright(`  ${chalk.bgGreenBright(group)}  `));

    if (tests.length > 0 && tests[0].wait) {
      for (const test of tests) {
        try {
          await test.fn();
          emitter.emit("pass", test.name);
        } catch (e: any) {
          const err = e.response?.data?.error || e.response?.data?.msg || e.message;
          emitter.emit("fail", test.name, err);
        }
      }
    } else {
      await Promise.all(
        tests.map((test) =>
          test
            .fn()
            .then(() => emitter.emit("pass", test.name))
            .catch((e) =>
              emitter.emit("fail", test.name, e.response?.data?.error || e.response?.data?.msg || e.message)
            )
        )
      );
    }
  }

  emitter.emit("end");
}

export async function run() {
  let total = Object.values(groups).reduce((acc, group) => acc + group.length, 0);
  let passes = 0;
  let fails = 0;

  console.log(chalk.green("Running tests..."));
  const events = new EventEmitter();
  runGroups(groups, events);

  events.on("pass", (name) => {
    console.log(chalk.green(`${chalk.greenBright(` ${name}`)} - ✅`));
    passes++;
  });

  events.on("fail", (name, error) => {
    console.log(chalk.red(`${chalk.redBright(` ${name}`)} - ${error} ❌`));
    fails++;
  });

  events.on("end", () => {
    console.log("\n");
    console.log(chalk.bgBlueBright(`    TOTAL ${total}   `));
    console.log(chalk.bgGreenBright(`    PASS ${passes}   `));
    console.log(chalk.bgRedBright(`    FAIL ${fails}   `));
    if (fails > 0) {
      process.exit(1);
    }
  });
}

export function expect(actual: any) {
  return {
    toBe: (expected?: any) => {
      if (typeof expected === "undefined") {
        return {
          defined: () => {
            if (typeof actual === "undefined") {
              throw new Error("Expected value to be defined");
            }
          },
        };
      }

      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
  };
}
