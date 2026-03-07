import { ModuleRegistry, Module, ModuleState } from '../../src/registry';

describe('Module Registry', () => {
  let registry: ModuleRegistry;

  beforeEach(() => {
    registry = new ModuleRegistry();
  });

  describe('register', () => {
    it('should register a module', () => {
      const module: Module = {
        name: 'test-module',
        version: '1.0.0',
      };

      registry.register(module);
      
      expect(registry.get('test-module')).toBe(module);
      expect(registry.getState('test-module')).toBe(ModuleState.UNINITIALIZED);
    });

    it('should not allow duplicate registration', () => {
      const module: Module = {
        name: 'test-module',
        version: '1.0.0',
      };

      registry.register(module);
      
      expect(() => registry.register(module)).toThrow('already registered');
    });
  });

  describe('initialize', () => {
    it('should initialize a module', async () => {
      let initialized = false;
      const module: Module = {
        name: 'test-module',
        version: '1.0.0',
        init: async () => {
          initialized = true;
        },
      };

      registry.register(module);
      await registry.initialize('test-module');
      
      expect(initialized).toBe(true);
      expect(registry.getState('test-module')).toBe(ModuleState.INITIALIZED);
    });

    it('should handle initialization errors', async () => {
      const module: Module = {
        name: 'error-module',
        version: '1.0.0',
        init: async () => {
          throw new Error('Init failed');
        },
      };

      registry.register(module);
      
      await expect(registry.initialize('error-module')).rejects.toThrow('Init failed');
      expect(registry.getState('error-module')).toBe(ModuleState.ERROR);
    });
  });

  describe('dependency resolution', () => {
    it('should initialize modules in dependency order', async () => {
      const initOrder: string[] = [];

      const moduleA: Module = {
        name: 'module-a',
        version: '1.0.0',
        init: async () => {
          initOrder.push('a');
        },
      };

      const moduleB: Module = {
        name: 'module-b',
        version: '1.0.0',
        dependencies: ['module-a'],
        init: async () => {
          initOrder.push('b');
        },
      };

      registry.register(moduleA);
      registry.register(moduleB);
      await registry.initializeAll();
      
      expect(initOrder).toEqual(['a', 'b']);
    });

    it('should detect missing dependencies', async () => {
      const module: Module = {
        name: 'dependent-module',
        version: '1.0.0',
        dependencies: ['non-existent'],
      };

      registry.register(module);
      
      await expect(registry.initialize('dependent-module')).rejects.toThrow('missing dependencies');
    });
  });

  describe('lifecycle management', () => {
    it('should manage full lifecycle', async () => {
      const lifecycle: string[] = [];

      const module: Module = {
        name: 'full-module',
        version: '1.0.0',
        init: async () => {
          lifecycle.push('init');
        },
        start: async () => {
          lifecycle.push('start');
        },
        stop: async () => {
          lifecycle.push('stop');
        },
      };

      registry.register(module);
      await registry.initialize('full-module');
      await registry.start('full-module');
      await registry.stop('full-module');
      
      expect(lifecycle).toEqual(['init', 'start', 'stop']);
      expect(registry.getState('full-module')).toBe(ModuleState.STOPPED);
    });
  });

  describe('list', () => {
    it('should list all registered modules', () => {
      registry.register({ name: 'module1', version: '1.0.0' });
      registry.register({ name: 'module2', version: '2.0.0' });
      
      const list = registry.list();
      
      expect(list).toHaveLength(2);
      expect(list[0].name).toBe('module1');
      expect(list[1].name).toBe('module2');
    });
  });
});
