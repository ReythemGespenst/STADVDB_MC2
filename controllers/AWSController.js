const {RDSClient, PromoteReadReplicaCommand, DescribeDBInstancesCommand, ModifyDBInstanceCommand} = require('@aws-sdk/client-rds');

require('dotenv').config();

const rdsClient = new RDSClient({
  region: 'ap-southeast-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const masterInstanceIdentifier = process.env.MASTER_INSTANCE_IDENTIFIER
const readReplicaIdentifier = process.env.READ_REPLICA_IDENTIFIER
const checkInterval = parseInt(process.env.CHECK_INTERVAL_MS, 10)

async function checkMasterStatus(masterInstanceIdentifier) {
  try {
    const command = new DescribeDBInstancesCommand({
      DBInstanceIdentifier: masterInstanceIdentifier,
    });

    const response = await rdsClient.send(command);
    const dbInstance = response.DBInstances[0];
    console.log(`Master Instance (${masterInstanceIdentifier}) Status:`, dbInstance.DBInstanceStatus);
    return dbInstance.DBInstanceStatus;
  } catch (error) {
    console.error('Error fetching master status:', error);
    return 'failed';
  }
}

async function promoteReadReplica(dbInstanceIdentifier) {
  try {
    const command = new PromoteReadReplicaCommand({
      DBInstanceIdentifier: dbInstanceIdentifier,
    });

    const response = await rdsClient.send(command);
    console.log(`Successfully promoted the read replica (${dbInstanceIdentifier}) as master:`, response);
  } catch (error) {
    console.error(`Error promoting read replica (${dbInstanceIdentifier}):`, error);
  }
}

async function configureAsReplica(originalMasterIdentifier, currentMasterEndpoint) {
  try {
    const command = new ModifyDBInstanceCommand({
      DBInstanceIdentifier: originalMasterIdentifier,
      ReplicationSourceIdentifier: currentMasterEndpoint,
    });

    const response = await rdsClient.send(command);
    console.log(`Original master (${originalMasterIdentifier}) reconfigured as replica of ${currentMasterEndpoint}:`, response);
  } catch (error) {
    console.error('Error reconfiguring original master as replica:', error);
  }
}

async function promoteOriginalMaster(originalMasterIdentifier) {
  try {
    const command = new PromoteReadReplicaCommand({
      DBInstanceIdentifier: originalMasterIdentifier,
    });

    const response = await rdsClient.send(command);
    console.log(`Original master (${originalMasterIdentifier}) promoted back to primary:`, response);
  } catch (error) {
    console.error(`Error promoting original master (${originalMasterIdentifier}):`, error);
  }
}

async function monitorAndFailover() {
  const status = await checkMasterStatus(masterInstanceIdentifier);

  if (status !== 'available') {
    console.log('Master instance is down. Initiating failover...');
    await promoteReadReplica(readReplicaIdentifier);

    const restoredStatus = await checkMasterStatus(masterInstanceIdentifier);
    if (restoredStatus === 'available') {
      console.log('Original master restored. Reconfiguring as replica...');
      await configureAsReplica(masterInstanceIdentifier, readReplicaIdentifier);
    }
  }
}

setInterval(monitorAndFailover, checkInterval);