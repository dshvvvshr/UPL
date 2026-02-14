/**
 * Basic Example: Getting Started with Prime Security
 * 
 * This example demonstrates:
 * 1. Initializing the system
 * 2. Using security primitives
 * 3. Working with the module registry
 * 4. Audit logging
 * 5. Graceful shutdown
 */

import { 
  primeSecurity, 
  crypto, 
  auditLogger, 
  AuditLevel,
  registry,
  Module 
} from '../src/index';

async function main() {
  console.log('=== Prime Security - Basic Example ===\n');

  // Step 1: Initialize the system
  console.log('1. Initializing Prime Security...');
  await primeSecurity.initialize();
  await primeSecurity.start();
  console.log('   ✓ System initialized and started\n');

  // Step 2: Check system status
  console.log('2. System Status:');
  const status = primeSecurity.getStatus();
  console.log(`   - Initialized: ${status.initialized}`);
  console.log(`   - Modules: ${status.modules.length}`);
  console.log(`   - Audit Events: ${status.auditEventCount}`);
  status.modules.forEach(m => {
    console.log(`     • ${m.name} (${m.version}) - ${m.state}`);
  });
  console.log();

  // Step 3: Use security primitives
  console.log('3. Security Operations:');
  
  // Hashing
  const data = 'sensitive information';
  const hashed = crypto.hash(data);
  console.log(`   - Hash of "${data}":`);
  console.log(`     ${hashed.substring(0, 32)}...`);
  
  // Random generation
  const random = crypto.generateSecureRandom(16);
  console.log(`   - Secure random (32 hex chars):`);
  console.log(`     ${random}`);
  
  // Input validation
  const safeInput = 'user@example.com';
  const unsafeInput = '<script>alert(1)</script>';
  console.log(`   - Validation:`);
  console.log(`     "${safeInput}" is safe: ${crypto.Validator.isSafeString(safeInput)}`);
  console.log(`     "${unsafeInput}" has XSS: ${crypto.Validator.hasXSS(unsafeInput)}`);
  console.log();

  // Step 4: Register a custom module
  console.log('4. Registering Custom Module:');
  
  const customModule: Module = {
    name: 'example-module',
    version: '1.0.0',
    dependencies: ['core-security'],
    
    init: async () => {
      auditLogger.log(
        AuditLevel.INFO,
        'example-module',
        'init',
        { message: 'Example module initializing' }
      );
      console.log('   - Example module initialized');
    },
    
    start: async () => {
      auditLogger.log(
        AuditLevel.INFO,
        'example-module',
        'start',
        { message: 'Example module starting' }
      );
      console.log('   - Example module started');
    },
    
    stop: async () => {
      console.log('   - Example module stopped');
    }
  };

  registry.register(customModule);
  await registry.initialize('example-module');
  await registry.start('example-module');
  console.log('   ✓ Custom module registered and running\n');

  // Step 5: Audit logging
  console.log('5. Audit Trail:');
  
  // Log some events
  auditLogger.log(
    AuditLevel.INFO,
    'example',
    'user-action',
    { action: 'login', userId: '123' }
  );
  
  auditLogger.log(
    AuditLevel.WARN,
    'example',
    'suspicious-activity',
    { reason: 'multiple failed attempts' }
  );

  // Query recent events
  const recentEvents = auditLogger.query({ limit: 5 });
  console.log(`   - Total events: ${auditLogger.count()}`);
  console.log(`   - Recent events (last 5):`);
  recentEvents.forEach(event => {
    console.log(`     [${event.level.toUpperCase()}] ${event.component}.${event.action}`);
  });
  console.log();

  // Step 6: Graceful shutdown
  console.log('6. Shutting Down:');
  try {
    await registry.stop('example-module');
    console.log('   ✓ Module "example-module" stopped');
  } catch (error) {
    console.error('   ✗ Failed to stop module "example-module":', error);
  }

  try {
    await primeSecurity.stop();
    console.log('   ✓ System shutdown complete\n');
  } catch (error) {
    console.error('   ✗ Failed to stop Prime Security:', error);
    // Rethrow so the top-level error handler can react appropriately.
    throw error;
  }

  console.log('=== Example Complete ===');
}

// Run the example
main().catch(error => {
  console.error('Error running example:', error);
  process.exit(1);
});
