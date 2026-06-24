/**
 * Prime Security - Main Entry Point
 * 
 * Bootstraps the self-organizing multi-agent security framework
 * based on the Core Directive and system blueprint (digital DNA).
 */

import { registry, Module } from './registry';
import { DNAManager } from './autonomic/dna';
import { auditLogger, complianceChecker, AuditLevel } from './governance/compliance';
import * as crypto from './security/crypto';

export class PrimeSecurity {
  private dnaManager: DNAManager;
  private initialized: boolean = false;
  private started: boolean = false;

  constructor() {
    this.dnaManager = new DNAManager();
  }

  /**
   * Initialize the system from blueprint
   */
  async initialize(blueprintJson?: string): Promise<void> {
    auditLogger.log(AuditLevel.INFO, 'system', 'initialize', {
      message: 'Starting Prime Security initialization',
    });

    try {
      // Load blueprint
      if (blueprintJson) {
        this.dnaManager.import(blueprintJson);
      } else {
        this.dnaManager.load(DNAManager.createMinimal());
      }

      auditLogger.log(AuditLevel.INFO, 'system', 'blueprint-loaded', {
        version: this.dnaManager.getBlueprint()?.version,
      });

      // Register core modules
      this.registerCoreModules();

      // Initialize all modules
      await registry.initializeAll();

      // Run compliance checks
      const isCompliant = await complianceChecker.isCompliant();
      if (!isCompliant) {
        throw new Error('System failed Core Directive compliance checks');
      }

      this.initialized = true;

      auditLogger.log(AuditLevel.INFO, 'system', 'initialized', {
        message: 'Prime Security successfully initialized',
      });
    } catch (error) {
      auditLogger.log(AuditLevel.CRITICAL, 'system', 'initialization-failed', {
        error: (error as Error).message,
      });
      throw error;
    }
  }

  /**
   * Start the system
   */
  async start(): Promise<void> {
    if (!this.initialized) {
      throw new Error('System must be initialized before starting');
    }

    auditLogger.log(AuditLevel.INFO, 'system', 'start', {
      message: 'Starting all modules',
    });

    await registry.startAll();

    this.started = true;

    auditLogger.log(AuditLevel.INFO, 'system', 'started', {
      message: 'Prime Security is now running',
    });
  }

  /**
   * Stop the system gracefully
   */
  async stop(): Promise<void> {
    auditLogger.log(AuditLevel.INFO, 'system', 'stop', {
      message: 'Stopping all modules',
    });

    await registry.stopAll();

    this.started = false;

    auditLogger.log(AuditLevel.INFO, 'system', 'stopped', {
      message: 'Prime Security has been stopped',
    });
  }

  /**
   * Get system status
   */
  getStatus(): {
    initialized: boolean;
    started: boolean;
    modules: Array<{ name: string; version: string; state: string }>;
    auditEventCount: number;
  } {
    return {
      initialized: this.initialized,
      started: this.started,
      modules: registry.list(),
      auditEventCount: auditLogger.count(),
    };
  }

  /**
   * Register core modules
   */
  private registerCoreModules(): void {
    const securityModule: Module = {
      name: 'core-security',
      version: '0.1.0',
      init: async () => {
        auditLogger.log(AuditLevel.INFO, 'core-security', 'init', {
          message: 'Security module initialized',
        });
      },
      start: async () => {
        auditLogger.log(AuditLevel.INFO, 'core-security', 'start', {
          message: 'Security services started',
        });
      },
    };

    const governanceModule: Module = {
      name: 'governance',
      version: '0.1.0',
      dependencies: ['core-security'],
      init: async () => {
        auditLogger.log(AuditLevel.INFO, 'governance', 'init', {
          message: 'Governance module initialized',
        });
      },
      start: async () => {
        auditLogger.log(AuditLevel.INFO, 'governance', 'start', {
          message: 'Governance services started',
        });
      },
    };

    registry.register(securityModule);
    registry.register(governanceModule);
  }
}

// Export main classes and utilities
export { registry, Module, ModuleState } from './registry';
export { DNAManager, SystemBlueprint } from './autonomic/dna';
export { auditLogger, complianceChecker, AuditLevel } from './governance/compliance';
export { crypto };

// Create and export default instance
export const primeSecurity = new PrimeSecurity();
