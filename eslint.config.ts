import { globalIgnores } from "eslint/config";
import {
  defineConfigWithVueTs,
  vueTsConfigs,
} from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfigWithVueTs(
  globalIgnores(["dist/**", "coverage/**"]),
  {
    name: "app/files-to-lint",
    files: ["src/**/*.{ts,mts,tsx,vue}", "*.ts"],
    extends: [
      pluginVue.configs["flat/recommended"],
      vueTsConfigs.recommended,
    ],
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      "vue/no-undef-components": ["error", {
        "ignorePatterns": []
      }],
      "vue/block-order": ["error", {
        "order": ["script", "template", "style"]
      }],
      "vue/max-attributes-per-line": [
        "error",
        {
          singleline: {
            max: 5,
          },
          multiline: {
            max: 1,
          },
        },
      ],
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "off",
      "@stylistic/semi": ["error", "always"],
      "vue/html-self-closing": "off",
    },
  },
);
