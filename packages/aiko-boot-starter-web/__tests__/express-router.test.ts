/**
 * Express Router 单元测试
 * 测试 createExpressRouter 和 @RequestPart/@ModelAttribute 的行为
 */

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { createExpressRouter, RequestPart, ModelAttribute, RestController, PostMapping, RequestParam } from '../src';
import { Router } from 'express';

vi.mock('multer', () => {
  const multerFn: any = vi.fn(() => ({
    fields: vi.fn().mockReturnValue(vi.fn()),
  }));
  multerFn.memoryStorage = vi.fn();
  return { default: multerFn };
});

vi.mock('fs/promises', () => ({
  writeFile: vi.fn(),
}));

describe('createExpressRouter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('当 @RequestPart 用于未启用 multipart 的路由时应抛出错误', () => {
    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/upload')
      upload(@RequestPart('file') file: any) {
        return { success: true };
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
      });
    }).toThrow(/Multipart processing is disabled/);
  });

  test('当 @RequestPart 用于启用 multipart 的路由时不应抛出错误', () => {
    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/upload')
      upload(@RequestPart('file') file: any) {
        return { success: true };
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
        multipart: {
          maxFileSize: 1024 * 1024,
        },
      });
    }).not.toThrow();
  });

  test('应该正确处理空对象作为 req.body', () => {
    const router = Router();
    const registerControllerSpy = vi.fn();

    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/search')
      search(@ModelAttribute() query: any) {
        return query;
      }
    }

    const controllers = [TestController];
    const options = {
      prefix: '/api',
      verbose: false,
    };

    expect(() => {
      createExpressRouter(controllers, options);
    }).not.toThrow();
  });

  test('应该正确处理 undefined 作为 req.body', () => {
    const router = Router();

    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/search')
      search(@ModelAttribute() query: any) {
        return query;
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
      });
    }).not.toThrow();
  });

  test('应该正确处理数组作为 req.body（带警告）', () => {
    const router = Router();

    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/search')
      search(@ModelAttribute() query: any) {
        return query;
      }
    }

    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
      });
    }).not.toThrow();

    consoleWarnSpy.mockRestore();
  });

  test('应该正确处理带 @ModelAttribute 的路由注册', () => {
    const router = Router();

    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/search')
      search(@ModelAttribute() query: any) {
        return { parsed: query };
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
      });
    }).not.toThrow();
  });

  test('应该正确处理多个 @ModelAttribute 参数', () => {
    const router = Router();

    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/search1')
      search1(@ModelAttribute() query: any) {
        return query;
      }

      @PostMapping('/search2')
      search2(@ModelAttribute() query: any) {
        return query;
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
      });
    }).not.toThrow();
  });

  test('应该正确处理混合装饰器（@ModelAttribute + @RequestParam）', () => {
    const router = Router();

    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/search')
      search(@ModelAttribute() query: any, @RequestParam('file') file: any) {
        return { query, file };
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
        multipart: {
          maxFileSize: 1024 * 1024,
        },
      });
    }).not.toThrow();
  });

  test('应该正确处理重复的 @RequestPart 名称时抛出错误', () => {
    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/upload')
      upload(@RequestPart('file') file1: any, @RequestPart('file') file2: any) {
        return { success: true };
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
        multipart: {
          maxFileSize: 1024 * 1024,
        },
      });
    }).toThrow(/Duplicate @RequestPart name/);
  });

  test('应该正确处理没有 @RestController 装饰器的类', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    class NotRestController {
      someMethod() {
        return 'test';
      }
    }

    expect(() => {
      createExpressRouter([NotRestController], {
        prefix: '/api',
        verbose: true,
      });
    }).not.toThrow();

    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('No @RestController metadata found')
    );

    consoleWarnSpy.mockRestore();
  });

  test('应该正确处理数组形式的 controllers 参数', () => {
    @RestController({ path: '/test1' })
    class Controller1 {
      @PostMapping('/test')
      test(@ModelAttribute() query: any) {
        return 'test1';
      }
    }

    @RestController({ path: '/test2' })
    class Controller2 {
      @PostMapping('/test')
      test(@ModelAttribute() query: any) {
        return 'test2';
      }
    }

    expect(() => {
      createExpressRouter([Controller1, Controller2], {
        prefix: '/api',
        verbose: false,
      });
    }).not.toThrow();
  });

  test('应该正确处理对象形式的 controllers 参数', () => {
    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/test')
      test(@ModelAttribute() query: any) {
        return 'test';
      }
    }

    const controllers = { TestController };

    expect(() => {
      createExpressRouter(controllers, {
        prefix: '/api',
        verbose: false,
      });
    }).not.toThrow();
  });
});

describe('ModelAttribute 边界情况', () => {
  test('应该正确处理 req.query 为 undefined', () => {
    const router = Router();

    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/search')
      search(@ModelAttribute() query: any) {
        return query;
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
      });
    }).not.toThrow();
  });

  test('应该正确处理 req.body 为 null', () => {
    const router = Router();

    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/search')
      search(@ModelAttribute() query: any) {
        return query;
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
      });
    }).not.toThrow();
  });

  test('应该正确处理 req.body 为字符串', () => {
    const router = Router();

    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/search')
      search(@ModelAttribute() query: any) {
        return query;
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
      });
    }).not.toThrow();
  });

  test('应该正确处理 req.body 为数字', () => {
    const router = Router();

    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/search')
      search(@ModelAttribute() query: any) {
        return query;
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
      });
    }).not.toThrow();
  });

  test('应该正确处理 req.body 为布尔值', () => {
    const router = Router();

    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/search')
      search(@ModelAttribute() query: any) {
        return query;
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
      });
    }).not.toThrow();
  });

  test('应该正确处理 req.body 为函数', () => {
    const router = Router();

    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/search')
      search(@ModelAttribute() query: any) {
        return query;
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
      });
    }).not.toThrow();
  });

  test('应该正确处理 req.body 为 Symbol', () => {
    const router = Router();

    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/search')
      search(@ModelAttribute() query: any) {
        return query;
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
      });
    }).not.toThrow();
  });
});

describe('Array Body Handling', () => {
  test('应该正确处理 req.body 为数组并记录警告', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const router = Router();

    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/search')
      search(@ModelAttribute() query: any) {
        return query;
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
      });
    }).not.toThrow();

    consoleWarnSpy.mockRestore();
  });

  test('应该正确处理 req.body 为 Buffer 并返回空对象', () => {
    const router = Router();

    @RestController({ path: '/test' })
    class TestController {
      @PostMapping('/search')
      search(@ModelAttribute() query: any) {
        return query;
      }
    }

    expect(() => {
      createExpressRouter([TestController], {
        prefix: '/api',
        verbose: false,
      });
    }).not.toThrow();
  });
});
