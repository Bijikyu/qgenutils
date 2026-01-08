// Global instance
let dbIntegration = null;

// Initialize database if run directly
if (require.main === module) {
  dbIntegration = new DatabaseIntegration();
  dbIntegration.initializeDatabase();
  
  console.log('🗄️ Database integration initialized');
  console.log('📊 Database file:', dbIntegration.dbPath);
  console.log('📊 Data directory:', dbIntegration.dataDir);
  console.log('📈 Ready for persistent data storage');
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down database integration...');
    if (dbIntegration) {
      console.log('📊 Closing database connections...');
      dbIntegration.backupDatabase('./backups/qgenutils-backup-' + new Date().toISOString() + '.db');
      console.log('📾 Database backed up');
    }
    
    dbIntegration.backupDatabase('./backups/qgenutils-backup-' + new Date().toISOString() + '.db');
    console.log('📊 Database backed up');
    
    process.exit(0);
  });
  
  console.log('Database integration monitoring... Press Ctrl+C to stop');
}

module.exports = DatabaseIntegration;