/**
 * Autonomic Computing - Digital DNA
 * 
 * Represents the system's blueprint that can be used to reconstruct,
 * repair, and evolve the system. Implements the "digital DNA" concept
 * from the architecture.
 */

export interface SystemBlueprint {
  version: string;
  coreDirective: CoreDirectiveReference;
  modules: ModuleDefinition[];
  configuration: SystemConfiguration;
  policies: Policy[];
}

export interface CoreDirectiveReference {
  version: string;
  checksum: string;
  url: string;
}

export interface ModuleDefinition {
  name: string;
  version: string;
  type: 'core' | 'extension' | 'plugin';
  repository?: string;
  configuration?: Record<string, unknown>;
  dependencies?: string[];
}

export interface SystemConfiguration {
  environment: 'development' | 'staging' | 'production';
  features: Record<string, boolean>;
  limits: ResourceLimits;
}

export interface ResourceLimits {
  maxMemoryMB?: number;
  maxCPUPercent?: number;
  maxConnections?: number;
  requestRateLimit?: number;
}

export interface Policy {
  name: string;
  type: 'security' | 'performance' | 'governance';
  enabled: boolean;
  rules: PolicyRule[];
}

export interface PolicyRule {
  condition: string;
  action: string;
  parameters?: Record<string, unknown>;
}

/**
 * DNA Manager - handles system blueprint
 */
export class DNAManager {
  private blueprint: SystemBlueprint | null = null;

  /**
   * Load system blueprint
   */
  load(blueprint: SystemBlueprint): void {
    this.validateBlueprint(blueprint);
    this.blueprint = blueprint;
  }

  /**
   * Get current blueprint
   */
  getBlueprint(): SystemBlueprint | null {
    return this.blueprint;
  }

  /**
   * Validate blueprint structure
   */
  private validateBlueprint(blueprint: SystemBlueprint): void {
    // Top-level version
    if (typeof blueprint.version !== 'string' || blueprint.version.trim() === '') {
      throw new Error('Blueprint must have a non-empty string version');
    }

    // Core directive
    const coreDirective = blueprint.coreDirective as unknown;
    if (
      !coreDirective ||
      typeof coreDirective !== 'object'
    ) {
      throw new Error('Blueprint must reference a valid Core Directive object');
    }
    const cd = coreDirective as CoreDirectiveReference;
    if (typeof cd.version !== 'string' || cd.version.trim() === '') {
      throw new Error('Core Directive must have a non-empty string version');
    }
    if (typeof cd.checksum !== 'string' || cd.checksum.trim() === '') {
      throw new Error('Core Directive must have a non-empty string checksum');
    }
    if (typeof cd.url !== 'string' || cd.url.trim() === '') {
      throw new Error('Core Directive must have a non-empty string url');
    }
    // Best-effort URL format check (ignore environments without URL constructor)
    try {
      // eslint-disable-next-line no-new
      new URL(cd.url);
    } catch {
      // Do not fail hard on URL parsing; only ensure it looks like a URL scheme
      if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(cd.url)) {
        throw new Error('Core Directive url must be a valid URL or URL-like string');
      }
    }

    // Modules
    if (!Array.isArray(blueprint.modules)) {
      throw new Error('Blueprint must have modules array');
    }
    blueprint.modules.forEach((mod, index) => {
      if (!mod || typeof mod !== 'object') {
        throw new Error(`Module at index ${index} must be an object`);
      }
      if (typeof mod.name !== 'string' || mod.name.trim() === '') {
        throw new Error(`Module at index ${index} must have a non-empty string name`);
      }
      if (typeof mod.version !== 'string' || mod.version.trim() === '') {
        throw new Error(`Module "${mod.name}" must have a non-empty string version`);
      }
      if (mod.type !== 'core' && mod.type !== 'extension' && mod.type !== 'plugin') {
        throw new Error(
          `Module "${mod.name}" has invalid type "${(mod as ModuleDefinition).type}", expected "core" | "extension" | "plugin"`,
        );
      }
      if (mod.repository !== undefined && typeof mod.repository !== 'string') {
        throw new Error(`Module "${mod.name}" repository must be a string if provided`);
      }
      if (mod.configuration !== undefined) {
        const cfg = mod.configuration;
        if (cfg === null || typeof cfg !== 'object' || Array.isArray(cfg)) {
          throw new Error(`Module "${mod.name}" configuration must be a non-null object if provided`);
        }
      }
      if (mod.dependencies !== undefined) {
        if (!Array.isArray(mod.dependencies)) {
          throw new Error(`Module "${mod.name}" dependencies must be an array of strings if provided`);
        }
        mod.dependencies.forEach((dep, depIndex) => {
          if (typeof dep !== 'string' || dep.trim() === '') {
            throw new Error(
              `Module "${mod.name}" dependency at index ${depIndex} must be a non-empty string`,
            );
          }
        });
      }
    });

    // Configuration
    const configuration = blueprint.configuration as unknown;
    if (!configuration || typeof configuration !== 'object') {
      throw new Error('Blueprint must have configuration object');
    }
    const config = configuration as SystemConfiguration;
    if (
      config.environment !== 'development' &&
      config.environment !== 'staging' &&
      config.environment !== 'production'
    ) {
      throw new Error(
        `Configuration environment must be one of "development", "staging", or "production"`,
      );
    }
    if (config.features === null || typeof config.features !== 'object' || Array.isArray(config.features)) {
      throw new Error('Configuration features must be an object mapping feature names to booleans');
    }
    Object.keys(config.features).forEach((key) => {
      if (typeof config.features[key] !== 'boolean') {
        throw new Error(`Configuration feature "${key}" must be a boolean`);
      }
    });

    const limits = config.limits as unknown;
    if (!limits || typeof limits !== 'object') {
      throw new Error('Configuration limits must be an object');
    }
    const resLimits = limits as ResourceLimits;
    const numericLimitFields: (keyof ResourceLimits)[] = [
      'maxMemoryMB',
      'maxCPUPercent',
      'maxConnections',
      'requestRateLimit',
    ];
    numericLimitFields.forEach((field) => {
      const value = resLimits[field];
      if (value !== undefined && (typeof value !== 'number' || Number.isNaN(value))) {
        throw new Error(`Configuration limits field "${String(field)}" must be a valid number if provided`);
      }
    });

    // Policies (optional)
    if (blueprint.policies !== undefined) {
      if (!Array.isArray(blueprint.policies)) {
        throw new Error('Policies must be an array if provided');
      }
      blueprint.policies.forEach((policy, index) => {
        if (!policy || typeof policy !== 'object') {
          throw new Error(`Policy at index ${index} must be an object`);
        }
        if (typeof policy.name !== 'string' || policy.name.trim() === '') {
          throw new Error(`Policy at index ${index} must have a non-empty string name`);
        }
        if (
          policy.type !== 'security' &&
          policy.type !== 'performance' &&
          policy.type !== 'governance'
        ) {
          throw new Error(
            `Policy "${policy.name}" has invalid type "${policy.type}", expected "security" | "performance" | "governance"`,
          );
        }
        if (typeof policy.enabled !== 'boolean') {
          throw new Error(`Policy "${policy.name}" enabled flag must be a boolean`);
        }
        if (!Array.isArray(policy.rules)) {
          throw new Error(`Policy "${policy.name}" rules must be an array`);
        }
        policy.rules.forEach((rule, ruleIndex) => {
          if (!rule || typeof rule !== 'object') {
            throw new Error(`Rule at index ${ruleIndex} in policy "${policy.name}" must be an object`);
          }
          if (typeof rule.condition !== 'string' || rule.condition.trim() === '') {
            throw new Error(
              `Rule at index ${ruleIndex} in policy "${policy.name}" must have a non-empty string condition`,
            );
          }
          if (typeof rule.action !== 'string' || rule.action.trim() === '') {
            throw new Error(
              `Rule at index ${ruleIndex} in policy "${policy.name}" must have a non-empty string action`,
            );
          }
          if (rule.parameters !== undefined) {
            const params = rule.parameters;
            if (params === null || typeof params !== 'object' || Array.isArray(params)) {
              throw new Error(
                `Rule parameters in policy "${policy.name}" must be a non-null object if provided`,
              );
            }
          }
        });
      });
    }
  }

  /**
   * Generate a minimal viable blueprint
   */
  static createMinimal(): SystemBlueprint {
    return {
      version: '0.1.0',
      coreDirective: {
        version: '1.0.0',
        checksum: 'placeholder-checksum-for-development',
        url: 'file://CORE_DIRECTIVE.md',
      },
      modules: [
        {
          name: 'core-security',
          version: '0.1.0',
          type: 'core',
        },
        {
          name: 'module-registry',
          version: '0.1.0',
          type: 'core',
        },
      ],
      configuration: {
        environment: 'development',
        features: {
          selfHealing: false,
          autoUpdate: false,
        },
        limits: {
          maxMemoryMB: 512,
          maxCPUPercent: 80,
        },
      },
      policies: [
        {
          name: 'core-directive-compliance',
          type: 'governance',
          enabled: true,
          rules: [
            {
              condition: 'on_module_load',
              action: 'validate_compliance',
            },
          ],
        },
      ],
    };
  }

  /**
   * Export blueprint as JSON
   */
  export(): string {
    if (!this.blueprint) {
      throw new Error('No blueprint loaded');
    }
    return JSON.stringify(this.blueprint, null, 2);
  }

  /**
   * Import blueprint from JSON
   */
  import(json: string): void {
    const blueprint = JSON.parse(json) as SystemBlueprint;
    this.load(blueprint);
  }
}
