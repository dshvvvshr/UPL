/**
 * Module Registry System
 * 
 * Implements a plugin architecture for dynamic module loading and lifecycle management.
 * Aligns with the modular autonomy principle from the Core Directive.
 */

export interface Module {
  name: string;
  version: string;
  dependencies?: string[];
  init?: () => Promise<void>;
  start?: () => Promise<void>;
  stop?: () => Promise<void>;
  destroy?: () => Promise<void>;
}

export enum ModuleState {
  UNINITIALIZED = 'uninitialized',
  INITIALIZING = 'initializing',
  INITIALIZED = 'initialized',
  STARTING = 'starting',
  RUNNING = 'running',
  STOPPING = 'stopping',
  STOPPED = 'stopped',
  ERROR = 'error',
}

interface ModuleEntry {
  module: Module;
  state: ModuleState;
  error?: Error;
}

/**
 * Central registry for managing modules
 */
export class ModuleRegistry {
  private modules: Map<string, ModuleEntry> = new Map();
  private startOrder: string[] = [];

  /**
   * Register a new module
   */
  register(module: Module): void {
    if (this.modules.has(module.name)) {
      throw new Error(`Module ${module.name} is already registered`);
    }

    this.modules.set(module.name, {
      module,
      state: ModuleState.UNINITIALIZED,
    });
  }

  /**
   * Get a module by name
   */
  get(name: string): Module | undefined {
    return this.modules.get(name)?.module;
  }

  /**
   * Get module state
   */
  getState(name: string): ModuleState | undefined {
    return this.modules.get(name)?.state;
  }

  /**
   * Check if all dependencies are satisfied
   */
  private checkDependencies(module: Module): string[] {
    const missing: string[] = [];
    
    if (module.dependencies) {
      for (const dep of module.dependencies) {
        if (!this.modules.has(dep)) {
          missing.push(dep);
        }
      }
    }
    
    return missing;
  }

  /**
   * Resolve module dependency order
   */
  private resolveDependencyOrder(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (name: string): void => {
      if (visited.has(name)) return;
      
      const entry = this.modules.get(name);
      if (!entry) return;

      // Check for circular dependency
      if (visiting.has(name)) {
        throw new Error(`Circular dependency detected involving module: ${name}`);
      }

      visiting.add(name);

      // Visit dependencies first
      if (entry.module.dependencies) {
        for (const dep of entry.module.dependencies) {
          visit(dep);
        }
      }

      visiting.delete(name);
      visited.add(name);
      order.push(name);
    };

    for (const name of this.modules.keys()) {
      visit(name);
    }

    return order;
  }

  /**
   * Initialize all modules in dependency order
   */
  async initializeAll(): Promise<void> {
    this.startOrder = this.resolveDependencyOrder();

    for (const name of this.startOrder) {
      await this.initialize(name);
    }
  }

  /**
   * Initialize a specific module
   */
  async initialize(name: string): Promise<void> {
    const entry = this.modules.get(name);
    if (!entry) {
      throw new Error(`Module ${name} not found`);
    }

    if (entry.state !== ModuleState.UNINITIALIZED) {
      return;
    }

    // Check dependencies
    const missing = this.checkDependencies(entry.module);
    if (missing.length > 0) {
      throw new Error(`Module ${name} has missing dependencies: ${missing.join(', ')}`);
    }

    entry.state = ModuleState.INITIALIZING;

    try {
      if (entry.module.init) {
        await entry.module.init();
      }
      entry.state = ModuleState.INITIALIZED;
    } catch (error) {
      entry.state = ModuleState.ERROR;
      entry.error = error as Error;
      throw error;
    }
  }

  /**
   * Start all initialized modules
   */
  async startAll(): Promise<void> {
    for (const name of this.startOrder) {
      await this.start(name);
    }
  }

  /**
   * Start a specific module
   */
  async start(name: string): Promise<void> {
    const entry = this.modules.get(name);
    if (!entry) {
      throw new Error(`Module ${name} not found`);
    }

    if (entry.state === ModuleState.RUNNING) {
      return;
    }

    if (entry.state !== ModuleState.INITIALIZED && entry.state !== ModuleState.STOPPED) {
      throw new Error(`Module ${name} must be initialized before starting`);
    }

    entry.state = ModuleState.STARTING;

    try {
      if (entry.module.start) {
        await entry.module.start();
      }
      entry.state = ModuleState.RUNNING;
    } catch (error) {
      entry.state = ModuleState.ERROR;
      entry.error = error as Error;
      throw error;
    }
  }

  /**
   * Stop all running modules in reverse order
   */
  async stopAll(): Promise<void> {
    const stopOrder = [...this.startOrder].reverse();
    
    for (const name of stopOrder) {
      await this.stop(name);
    }
  }

  /**
   * Stop a specific module
   */
  async stop(name: string): Promise<void> {
    const entry = this.modules.get(name);
    if (!entry) {
      throw new Error(`Module ${name} not found`);
    }

    // Only ignore stop requests for modules that are clearly inactive or already stopping.
    if (
      entry.state === ModuleState.UNINITIALIZED ||
      entry.state === ModuleState.STOPPED ||
      entry.state === ModuleState.STOPPING
    ) {
      return;
    }

    entry.state = ModuleState.STOPPING;

    try {
      if (entry.module.stop) {
        await entry.module.stop();
      }
      entry.state = ModuleState.STOPPED;
    } catch (error) {
      entry.state = ModuleState.ERROR;
      entry.error = error as Error;
      throw error;
    }
  }

  /**
   * List all registered modules
   */
  list(): Array<{ name: string; version: string; state: ModuleState }> {
    return Array.from(this.modules.entries()).map(([name, entry]) => ({
      name,
      version: entry.module.version,
      state: entry.state,
    }));
  }
}

// Global registry instance
export const registry = new ModuleRegistry();
