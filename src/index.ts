import chalk from "chalk";
import EventEmitter from "events";
import log from "./logging";

type TestFn = () => Promise<void> | void;

type Test = {
  name: string;
  wait?: boolean;
  fn: TestFn;
};

type Group = {
  name: string;
  async?: boolean;
  tests: Test[];
};

type It = (
  name: string,
  fn: TestFn
) => {
  wait: () => void;
};

const TestGroups = new Map<string, Group>();

export function test(group: string, test: (it: It) => void) {
  test((name, fn) => {
    let testGroup = TestGroups.get(group)!;
    if (!testGroup) {
      TestGroups.set(group, {
        name,
        tests: [{ name, fn }],
      });
    } else {
      testGroup.tests.push({
        name,
        fn,
      });
    }

    return {
      wait: () => {
        testGroup.tests[testGroup.tests.length - 1].wait = true;
      },
    };
  });
}

async function _run(groups: Group[], emitter: EventEmitter) {
  for (const { name, tests, async } of groups) {
  }
}

export function run() {
  const groups = Array.from(TestGroups.values());
  let total = Object.values(groups).reduce(
    (acc, group) => acc + group.tests.length,
    0
  );
  let passes = 0;
  let fails = 0;

  console.log(chalk.green("Running tests..."));
  const events = new EventEmitter();
  _run(groups, events);

  events.on("pass", (name) => {
    log.green(`${name} - ✅`);
    passes++;
  });

  events.on("fail", (name, error) => {
    log.red(`${name} - ${error} ❌`);
    fails++;
  });

  events.on("end", () => {
    console.log("\n");
    log.blue(`${passes}/${total} tests passed`);
    log.green(`PASS ${passes}`);
    log.red(`FAIL ${fails}`);
    if (fails > 0) {
      process.exit(1);
    }
  });
}

export function expect<T>(actual: T) {
  return {
    toBe: (expected: T) => {
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
