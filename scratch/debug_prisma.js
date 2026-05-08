const { PrismaClient } = require('@prisma/client');
console.log('PrismaClient constructor:', PrismaClient.toString());
try {
  const p = new PrismaClient();
  console.log('Success with no args');
} catch (e) {
  console.log('Error with no args:', e.message);
}
try {
  const p = new PrismaClient({ datasources: { db: { url: 'postgresql://' } } });
  console.log('Success with datasources');
} catch (e) {
  console.log('Error with datasources:', e.message);
}
try {
  const p = new PrismaClient({ datasourceUrl: 'postgresql://' });
  console.log('Success with datasourceUrl');
} catch (e) {
  console.log('Error with datasourceUrl:', e.message);
}
