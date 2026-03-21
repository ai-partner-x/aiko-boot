import type { Command } from 'commander';
import { createAddApiUseCase } from '../usecases/add-api.usecase.js';
import { createCliLogger } from '../core/logger.js';
import { createPrompter } from '../core/prompts.js';

/**
 * add api 命令：在现有脚手架中新增服务端工程（默认包含数据库）。
 */
export function registerAddApiCommand(program: Command): void {
  program
    .command('add-api')
    .argument('[name]', '服务端名称，例如 api、user-api')
    .option('--db <db>', '数据库类型：sqlite | postgres | mysql')
    .option('--preset <preset>', '服务端预设：plain | system')
    .option('--features <items>', '要启用的组件，逗号分隔：mq,file,redis,log')
    .option('--yes', '非交互模式：缺省值直接使用默认值')
    .option('--interactive', '强制交互模式（即使已检测到非 TTY）')
    .option('--root <dir>', '脚手架根目录（默认：当前工作目录）')
    .option('--dry-run', '仅显示将要执行的操作，不实际写入文件')
    .description('在现有脚手架中新增服务端工程（自动包含数据库初始化逻辑）')
    .action(async (name: string | undefined, options: any) => {
      const logger = createCliLogger();
      const prompter = createPrompter();
      const usecase = createAddApiUseCase({ logger, prompter });

      try {
        await usecase.execute({
          name,
          db: options.db,
          preset: options.preset,
          features: options.features,
          yes: !!options.yes,
          interactive: !!options.interactive,
          rootDir: options.root,
          dryRun: !!options.dryRun,
        });
      } catch (err) {
        logger.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    });
}

