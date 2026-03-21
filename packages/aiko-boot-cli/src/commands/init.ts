import type { Command } from 'commander';
import { createInitUseCase } from '../usecases/init-scaffold.usecase.js';
import { createCliLogger } from '../core/logger.js';
import { createPrompter } from '../core/prompts.js';

/**
 * create 命令：创建新的脚手架 monorepo。
 *
 * 仅搭建参数和调用用例层的骨架，实际业务逻辑在 usecase 中实现。
 */
export function registerCreateCommand(program: Command): void {
  program
    .command('create')
    .argument('[targetDir]', '目标目录（默认：当前目录下以项目名命名的文件夹）')
    .option('-n, --name <name>', '项目名 / scope，例如 my-app')
    .option('--with-admin-suite', '创建 admin + mobile + system(api) 套件')
    .option('--db <db>', 'with-admin-suite 时的数据库类型：sqlite | postgres | mysql')
    .option('--features <items>', 'with-admin-suite 时启用的组件，逗号分隔：mq,file,redis,log')
    .option('--empty', '仅创建空的 monorepo 结构')
    .option('--dry-run', '仅显示将要执行的操作，不实际写入文件')
    .description('创建一个新的 aiko-boot 脚手架 monorepo')
    .action(async (targetDir: string | undefined, options: any) => {
      const logger = createCliLogger();
      const prompter = createPrompter();
      const usecase = createInitUseCase({ logger, prompter });

      try {
        await usecase.execute({
          targetDir,
          name: options.name,
          withAdminSuite: !!options.withAdminSuite,
          db: options.db,
          features: options.features,
          empty: !!options.empty,
          dryRun: !!options.dryRun,
        });
      } catch (err) {
        logger.error(err instanceof Error ? err.message : String(err));
        process.exit(1);
      }
    });
}

