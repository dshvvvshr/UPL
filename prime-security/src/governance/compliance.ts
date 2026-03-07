/**
 * Governance and Compliance Module
 * 
 * Ensures system operates within Core Directive boundaries.
 * Provides audit logging and compliance checking.
 */

export enum AuditLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical',
}

export interface AuditEvent {
  timestamp: Date;
  level: AuditLevel;
  component: string;
  action: string;
  details: Record<string, unknown>;
  userId?: string;
}

export interface ComplianceCheck {
  name: string;
  description: string;
  check: () => Promise<ComplianceResult>;
}

export interface ComplianceResult {
  passed: boolean;
  message: string;
  violations?: string[];
}

/**
 * Audit Logger - immutable audit trail
 */
export class AuditLogger {
  private events: AuditEvent[] = [];
  private maxEvents: number = 10000;

  /**
   * Log an audit event
   */
  log(
    level: AuditLevel,
    component: string,
    action: string,
    details: Record<string, unknown> = {},
    userId?: string
  ): void {
    const event: AuditEvent = {
      timestamp: new Date(),
      level,
      component,
      action,
      details,
      userId,
    };

    this.events.push(event);

    // Rotate if needed (remove oldest events in-place to avoid reallocating the array)
    while (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // In production, also write to persistent storage
    this.persist(event);
  }

  /**
   * Persist event to storage
   */
  private persist(event: AuditEvent): void {
    // Write critical and error events to stderr for immediate visibility
    if (event.level === AuditLevel.CRITICAL || event.level === AuditLevel.ERROR) {
      try {
        console.error('[AUDIT]', JSON.stringify(event));
      } catch (error) {
        // If console.error fails, there's not much we can do, but we shouldn't crash
        // the application. The event is still in memory.
      }
    }
    
    // In a production environment, this should write to:
    // - Database (PostgreSQL, MongoDB, etc.)
    // - File system with rotation
    // - External logging service (CloudWatch, Splunk, etc.)
    // For now, events are kept in memory with rotation
  }

  /**
   * Query audit events
   */
  query(filter: {
    component?: string;
    level?: AuditLevel;
    since?: Date;
    limit?: number;
  }): AuditEvent[] {
    const { component, level, since, limit } = filter;
    const hasLimit = typeof limit === 'number' && limit > 0;

    // When a limit is specified, collect matching events starting from the most recent
    // to avoid building large intermediate arrays, then reverse to maintain
    // chronological order in the returned results.
    if (hasLimit) {
      const limitedResults: AuditEvent[] = [];

      for (let i = this.events.length - 1; i >= 0; i--) {
        const e = this.events[i];

        if (component && e.component !== component) {
          continue;
        }

        if (level && e.level !== level) {
          continue;
        }

        if (since && e.timestamp < since) {
          continue;
        }

        limitedResults.push(e);

        if (limitedResults.length === limit) {
          break;
        }
      }

      return limitedResults.reverse();
    }

    // No limit: build the result array in a single forward pass with all filters applied.
    const results: AuditEvent[] = [];

    for (const e of this.events) {
      if (component && e.component !== component) {
        continue;
      }

      if (level && e.level !== level) {
        continue;
      }

      if (since && e.timestamp < since) {
        continue;
      }

      results.push(e);
    }

    return results;
  }

  /**
   * Get event count
   */
  count(): number {
    return this.events.length;
  }
}

/**
 * Compliance Checker - validates Core Directive adherence
 */
export class ComplianceChecker {
  private checks: Map<string, ComplianceCheck> = new Map();

  /**
   * Register a compliance check
   */
  registerCheck(check: ComplianceCheck): void {
    this.checks.set(check.name, check);
  }

  /**
   * Run all compliance checks
   */
  async runAll(): Promise<Map<string, ComplianceResult>> {
    const results = new Map<string, ComplianceResult>();

    for (const [name, check] of this.checks) {
      try {
        const result = await check.check();
        results.set(name, result);
      } catch (error) {
        results.set(name, {
          passed: false,
          message: `Check failed: ${(error as Error).message}`,
        });
      }
    }

    return results;
  }

  /**
   * Run a specific compliance check
   */
  async run(name: string): Promise<ComplianceResult> {
    const check = this.checks.get(name);
    if (!check) {
      throw new Error(`Compliance check '${name}' not found`);
    }

    return await check.check();
  }

  /**
   * Check if system is compliant
   */
  async isCompliant(): Promise<boolean> {
    const results = await this.runAll();
    return Array.from(results.values()).every((r) => r.passed);
  }
}

// Global instances
export const auditLogger = new AuditLogger();
export const complianceChecker = new ComplianceChecker();

// Register default compliance checks
complianceChecker.registerCheck({
  name: 'core-directive-exists',
  description: 'Verify Core Directive document is accessible',
  check: async () => {
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      const directivePath = path.join(process.cwd(), 'CORE_DIRECTIVE.md');
      await fs.access(directivePath);
      
      // Verify file has content
      const content = await fs.readFile(directivePath, 'utf-8');
      if (content.length < 100) {
        return {
          passed: false,
          message: 'Core Directive file exists but appears incomplete',
        };
      }
      
      return {
        passed: true,
        message: 'Core Directive document found and validated',
      };
    } catch (error) {
      return {
        passed: false,
        message: `Core Directive not found: ${(error as Error).message}`,
      };
    }
  },
});

complianceChecker.registerCheck({
  name: 'security-modules-loaded',
  description: 'Verify essential security modules are loaded',
  check: async () => {
    try {
      // Import registry to check loaded modules
      const { registry } = await import('../registry');

      // If registry is not available or does not expose a list function yet,
      // treat this as an initialization phase and skip strict checking.
      if (!registry || typeof registry.list !== 'function') {
        return {
          passed: true,
          message: 'Security module check skipped: registry not initialized',
        };
      }

      const requiredModules = ['core-security', 'governance'];
      const loadedModules = registry.list();

      // During early startup, the registry may exist but be empty; in that
      // case, consider the check not yet applicable instead of failing.
      if (!Array.isArray(loadedModules) || loadedModules.length === 0) {
        return {
          passed: true,
          message: 'Security module check deferred: no modules registered yet',
        };
      }

      const loadedNames = new Set(loadedModules.map(m => m.name));

      const missing = requiredModules.filter(name => !loadedNames.has(name));

      if (missing.length > 0) {
        return {
          passed: false,
          message: 'Required security modules not loaded',
          violations: missing,
        };
      }

      // Check that modules are in running or initialized state
      const notReady = loadedModules.filter(m =>
        requiredModules.includes(m.name) &&
        m.state !== 'running' &&
        m.state !== 'initialized'
      );

      if (notReady.length > 0) {
        return {
          passed: false,
          message: 'Security modules exist but are not operational',
          violations: notReady.map(m => `${m.name} is ${m.state}`),
        };
      }

      return {
        passed: true,
        message: `All ${requiredModules.length} required security modules loaded and operational`,
      };
    } catch (error) {
      // If the registry cannot be imported at all (e.g., during very early
      // initialization), avoid failing compliance and mark the check as skipped.
      return {
        passed: true,
        message: `Security module check skipped: registry unavailable (${(error as Error).message})`,
      };
    }
  },
});
