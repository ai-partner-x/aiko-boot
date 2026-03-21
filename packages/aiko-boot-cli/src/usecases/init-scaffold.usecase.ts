import path from 'path';
import fs from 'fs-extra';
import type { Logger } from '../core/logger.js';
import type { Prompter } from '../core/prompts.js';
import {
  AikoProjectConfig,
  saveProjectConfig,
} from '../core/project-config.js';
import { syncRootPackageJson } from '../core/workspace.js';
import { createAddApiUseCase } from './add-api.usecase.js';
import { createAddAppUseCase } from './add-app.usecase.js';

export type InitScaffoldInput = {
  targetDir?: string;
  name?: string;
  withAdminSuite: boolean;
  db?: string;
  features?: string;
  empty: boolean;
  dryRun: boolean;
};

export type InitScaffoldDeps = {
  logger: Logger;
  prompter: Prompter;
};

export function createInitUseCase(deps: InitScaffoldDeps) {
  const { logger, prompter } = deps;

  async function resolveInput(input: InitScaffoldInput): Promise<{
    targetDir: string;
    name: string;
    options: Omit<InitScaffoldInput, 'targetDir' | 'name'>;
  }> {
    const cwd = process.cwd();
    let name = input.name;
    let targetDir = input.targetDir;

    // 如果没有显式指定 name，则优先根据 targetDir 推断（取目录名），再退回到交互输入
    if (!name && targetDir) {
      name = path.basename(targetDir);
    }
    if (!name) {
      name = await prompter.input('项目名称（例如 my-app）', 'my-app');
    }

    if (!targetDir) {
      const defaultDir = path.join(cwd, name);
      const answer = await prompter.input(
        '目标目录',
        path.relative(cwd, defaultDir) || defaultDir,
      );
      targetDir = path.resolve(cwd, answer || defaultDir);
    }

    const resolvedName = name!;
    const resolvedTargetDir = targetDir!;

    return {
      targetDir: resolvedTargetDir,
      name: resolvedName,
      options: {
        withAdminSuite: input.withAdminSuite,
        db: input.db,
        features: input.features,
        empty: input.empty,
        dryRun: input.dryRun,
      },
    };
  }

  async function execute(input: InitScaffoldInput): Promise<void> {
    const { targetDir, name, options } = await resolveInput(input);

    if (options.dryRun) {
      logger.info('[dry-run] 将会创建脚手架：');
      logger.info(`  name: ${name}`);
      logger.info(`  targetDir: ${targetDir}`);
      logger.info(
        `  empty: ${options.empty}, withAdminSuite: ${options.withAdminSuite}, db: ${options.db ?? '(default)'}, features: ${options.features ?? '(none)'}`,
      );
      return;
    }

    logger.info(`创建 aiko-boot 脚手架到：${targetDir}`);
    await fs.ensureDir(path.dirname(targetDir));

    // 步骤 1: 总是先创建空骨架和基础配置文件
    await fs.ensureDir(targetDir);
    await fs.ensureDir(path.join(targetDir, 'packages'));

    const rootPkgPath = path.join(targetDir, 'package.json');
    if (!(await fs.pathExists(rootPkgPath))) {
      await fs.writeJson(
        rootPkgPath,
        {
          name: `${name}-monorepo`,
          private: true,
          version: '0.1.0',
          scripts: {
            dev: 'echo "Add dev scripts in each package (api/admin/mobile) after created."',
          },
        },
        { spaces: 2 },
      );
    }

    const workspacePath = path.join(targetDir, 'pnpm-workspace.yaml');
    if (!(await fs.pathExists(workspacePath))) {
      await fs.writeFile(
        workspacePath,
        `packages:
  - 'packages/*'
`,
        'utf-8',
      );
    }

    // 步骤 2: 创建 .aiko-boot.json 配置文件
    const config: AikoProjectConfig = {
      version: 1,
      scope: name,
      packageManager: 'pnpm',
      apps: [],
      apis: [],
    };
    await saveProjectConfig(targetDir, config);

    if (options.empty && options.withAdminSuite) {
      throw new Error('--empty 和 --with-admin-suite 不能同时使用。');
    }

    // 步骤 3: with-admin-suite 时复用 add-api/add-app 逻辑，自动创建 admin+mobile+system(api)
    if (options.withAdminSuite) {
      const addApiUseCase = createAddApiUseCase({ logger, prompter });
      const addAppUseCase = createAddAppUseCase({ logger, prompter });

      logger.info('正在添加 System API 服务端...');
      const shouldPromptApiOptions =
        options.db === undefined || options.features === undefined;
      await addApiUseCase.execute({
        name: 'system',
        preset: 'system',
        db: options.db,
        features: options.features,
        yes: false,
        interactive: shouldPromptApiOptions,
        rootDir: targetDir,
        dryRun: false,
      });

      logger.info('正在添加 Admin 应用...');
      await addAppUseCase.execute({
        name: 'admin',
        type: 'admin',
        rootDir: targetDir,
        dryRun: false,
      });

      logger.info('正在添加 Mobile 应用...');
      await addAppUseCase.execute({
        name: 'mobile',
        type: 'mobile',
        rootDir: targetDir,
        dryRun: false,
      });
    }

    // 最后统一同步根 package.json（scripts / pnpm.onlyBuiltDependencies 等）
    await syncRootPackageJson(targetDir);

    logger.info('脚手架创建完成。');
  }

  return { execute };
}

