import next from "eslint-config-next";

const config = [
  ...next,
  {
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];

export default config;
