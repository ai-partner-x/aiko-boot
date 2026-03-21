import {
  input as inquirerInput,
  confirm as inquirerConfirm,
  select as inquirerSelect,
  checkbox as inquirerCheckbox,
} from '@inquirer/prompts';

export type Prompter = {
  input: (question: string, defaultValue?: string) => Promise<string>;
  confirm: (question: string, defaultValue?: boolean) => Promise<boolean>;
  select: (
    question: string,
    options: string[],
    defaultValue?: string,
  ) => Promise<string>;
  multiSelect: (
    question: string,
    options: string[],
    defaultValues?: string[],
  ) => Promise<string[]>;
};

export function createPrompter(): Prompter {
  return {
    async input(question: string, defaultValue?: string): Promise<string> {
      return inquirerInput({
        message: question,
        default: defaultValue,
      });
    },

    async confirm(question: string, defaultValue = false): Promise<boolean> {
      return inquirerConfirm({
        message: question,
        default: defaultValue,
      });
    },

    async select(
      question: string,
      options: string[],
      defaultValue?: string,
    ): Promise<string> {
      if (options.length === 0) {
        throw new Error('select options 不能为空');
      }
      const fallback = defaultValue ?? options[0];
      if (!options.includes(fallback)) {
        throw new Error(`select 默认值不在选项中：${fallback}`);
      }
      return inquirerSelect({
        message: question,
        choices: options.map((item) => ({ value: item, name: item })),
        default: fallback,
      });
    },

    async multiSelect(
      question: string,
      options: string[],
      defaultValues: string[] = [],
    ): Promise<string[]> {
      if (options.length === 0) return [];
      const defaults = defaultValues.filter((x) => options.includes(x));
      return inquirerCheckbox({
        message: question,
        choices: options.map((item) => ({
          value: item,
          name: item,
          checked: defaults.includes(item),
        })),
      });
    },
  };
}

