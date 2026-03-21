import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs-extra';
import type { Logger } from '../core/logger.js';
import type { Prompter } from '../core/prompts.js';
import { loadProjectConfig } from '../core/project-config.js';
import {
  ensurePnpmWorkspace,
  syncRootPackageJson,
  withProjectConfig,
} from '../core/workspace.js';
import { replaceScopeInDir } from '../core/template-utils.js';
import { createEnvUseCase } from './env.usecase.js';
import { createAddFeatureUseCase } from './add-feature.usecase.js';

export type AddApiInput = {
  name?: string;
  db?: string;
  preset?: string;
  features?: string;
  yes: boolean;
  interactive: boolean;
  rootDir?: string;
  dryRun: boolean;
};

export type AddApiDeps = {
  logger: Logger;
  prompter: Prompter;
};

export function createAddApiUseCase(deps: AddApiDeps) {
  const { logger, prompter } = deps;

  async function execute(input: AddApiInput): Promise<void> {
    let { name } = input;
    let db = input.db;
    let preset = input.preset;
    const rootDir = input.rootDir ?? process.cwd();
    const allowedDbs = ['sqlite', 'postgres', 'mysql'] as const;
    const allowedPresets = ['plain', 'system'] as const;
    const allowedFeatures = ['mq', 'file', 'redis', 'log'] as const;

    const config = await loadProjectConfig(rootDir);
    if (!config) {
      throw new Error(
        '未找到 .aiko-boot.json，当前目录似乎不是脚手架根目录，请在 create 生成的根目录下执行。',
      );
    }

    if (!name) {
      name = await prompter.input('服务端名称（包名）', 'api');
    }

    if (db && !allowedDbs.includes(db as (typeof allowedDbs)[number])) {
      throw new Error(
        `不支持的数据库类型: ${db}，仅支持 ${allowedDbs.join(' | ')}`,
      );
    }
    if (
      preset &&
      !allowedPresets.includes(preset as (typeof allowedPresets)[number])
    ) {
      throw new Error(
        `不支持的 preset: ${preset}，仅支持 ${allowedPresets.join(' | ')}`,
      );
    }

    const featuresFromArg = parseFeatureList(input.features);
    const invalidFeatures = featuresFromArg.filter(
      (x) => !allowedFeatures.includes(x as (typeof allowedFeatures)[number]),
    );
    if (invalidFeatures.length > 0) {
      throw new Error(
        `不支持的组件: ${invalidFeatures.join(', ')}，仅支持 ${allowedFeatures.join(', ')}`,
      );
    }

    const shouldPrompt = input.interactive || (!input.yes && process.stdin.isTTY);
    if (!preset) {
      if (shouldPrompt) {
        preset = await prompter.select('请选择 API 预设', [...allowedPresets], 'plain');
      } else {
        preset = 'plain';
      }
    }
    if (!db) {
      if (shouldPrompt) {
        db = await prompter.select(
          '请选择数据库类型',
          [...allowedDbs],
          'sqlite',
        );
      } else {
        db = 'sqlite';
      }
    }

    const selectedFeatures = input.features
      ? featuresFromArg
      : shouldPrompt
        ? await prompter.multiSelect('请选择要启用的组件（可多选）', [...allowedFeatures], [])
        : [];

    // 计算模板根目录：
    // - 默认使用 CLI 包内部模板（plain => templates/api-clean，system => templates/api-system）
    const defaultTemplatePlainApiDir = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../templates/api-clean',
    );
    const defaultTemplateSystemApiDir = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../../templates/api-system',
    );
    const defaultTemplateApiDir =
      preset === 'system' && (await fs.pathExists(defaultTemplateSystemApiDir))
        ? defaultTemplateSystemApiDir
        : defaultTemplatePlainApiDir;
    if (preset === 'system' && defaultTemplateApiDir !== defaultTemplateSystemApiDir) {
      logger.warn?.(
        `未找到 system 预设模板目录：${defaultTemplateSystemApiDir}，已回退到 plain 模板：${defaultTemplatePlainApiDir}`,
      );
    }
    const templateApiDir = defaultTemplateApiDir;

    if (input.dryRun) {
      logger.info(
        `[dry-run] 将在 ${rootDir} 中新增服务端：name=${name}, db=${db}`,
      );
      logger.info(`[dry-run] API 预设：${preset}`);
      logger.info(
        `[dry-run] 组件配置：${selectedFeatures.length > 0 ? selectedFeatures.join(', ') : '(none)'}`,
      );
      logger.info(`[dry-run] 使用模板目录: ${templateApiDir}`);
      return;
    }
    if (!(await fs.pathExists(templateApiDir))) {
      throw new Error(`模板不存在：${templateApiDir}`);
    }

    const packagesDir = path.join(rootDir, 'packages');
    const apiDir = path.join(packagesDir, name);

    if (await fs.pathExists(apiDir)) {
      throw new Error(`目标服务端目录已存在：${apiDir}`);
    }

    await fs.ensureDir(packagesDir);
    await fs.copy(templateApiDir, apiDir);

    const pkgPath = path.join(apiDir, 'package.json');
    if (await fs.pathExists(pkgPath)) {
      const pkg = await fs.readJson(pkgPath);
      const scope = config.scope;
      if (scope) {
        pkg.name = `@${scope}/${name}`;
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
        await replaceScopeInDir(apiDir, 'scaffold', scope);
      } else {
        pkg.name = name;
        await fs.writeJson(pkgPath, pkg, { spaces: 2 });
      }
    }

    await ensurePnpmWorkspace(rootDir);
    await withProjectConfig(rootDir, (cfg) => {
      const apis = cfg.apis ?? [];
      apis.push({
        name: name!,
        path: path.join('packages', name!),
        db,
        preset,
        features: [],
      });
      cfg.apis = apis;
    });

    // 同步根 package.json（dev/build/start:api 等脚本）
    await syncRootPackageJson(rootDir);

    // 补齐现有工程已启用的环境（例如用户先 `env add qa`，再 add-api 时，新的 api 也应拥有 .env.qa 与对应脚本）
    const envUseCase = createEnvUseCase({ logger });
    const existingModes = await envUseCase.list({ rootDir });
    const modesToEnsure = existingModes.length > 0 ? existingModes : ['dev', 'stage', 'prod'];
    for (const mode of modesToEnsure) {
      await envUseCase.add({
        rootDir,
        mode,
        dryRun: false,
        force: false,
        onExisting: 'skip',
        injectScripts: true,
      });
    }

    if (selectedFeatures.length > 0) {
      const featureUseCase = createAddFeatureUseCase({ logger, prompter });
      for (const feature of selectedFeatures) {
        await featureUseCase.execute({
          serviceName: name,
          feature,
          rootDir,
          dryRun: false,
        });
      }
    }

    logger.info(
      `已在 ${apiDir} 创建服务端 "${name}"（preset=${preset}，db=${db}，features=${selectedFeatures.length > 0 ? selectedFeatures.join(',') : 'none'}）。`,
    );
  }

  return { execute };
}

function parseFeatureList(features?: string): string[] {
  if (!features) return [];
  return [...new Set(features.split(',').map((x) => x.trim()).filter(Boolean))];
}

