const { RDSClient, PromoteReadReplicaCommand, DescribeDBInstancesCommand, ModifyDBInstanceCommand } = require('@aws-sdk/client-rds');

const rdsClient = new RDSClient({
    region: 'your-region',
    credentials: {
        accessKeyId: 'your-access-key-id',
        secretAccessKey: 'your-secret-access-key'
    }
});

async function promoteReadReplica(dbInstanceIdentifier) {
    try {
        const command = new PromoteReadReplicaCommand({
            DBInstanceIdentifier: dbInstanceIdentifier,
        });

        const data = await rdsClient.send(command);
        console.log(`Successfully promoted the read replica: `, data);
    } catch (err) {
        console.error(`Error promoting read replica: `, err);
    }
}

async function checkMasterStatus(masterInstanceIdentifier) {
    try {
        const command = new DescribeDBInstancesCommand({
            DBInstanceIdentifier: masterInstanceIdentifier,
        });

        const response = await rdsClient.send(command);
        const dbInstance = response.DBInstances[0];

        console.log('Master Instance Status:', dbInstance.DBInstanceStatus);
        return dbInstance.DBInstanceStatus;
    } catch (error) {
        console.error('Error fetching master status:', error);
        return 'failed';
    }
}

async function configureAsReplica(originalMasterIdentifier, currentMasterEndpoint) {
    try {
        const command = new ModifyDBInstanceCommand({
            DBInstanceIdentifier: originalMasterIdentifier,
            ReplicationSourceIdentifier: currentMasterEndpoint,
        });
        await rdsClient.send(command);
        console.log('Original master configured as replica.');
    } catch (err) {
        console.error(`Error configuring as replica: `, err);
    }
}

async function promoteOriginalMaster(originalMasterIdentifier) {
    try {
        const command = new PromoteReadReplicaCommand({
            DBInstanceIdentifier: originalMasterIdentifier,
        });
        await rdsClient.send(command);
        console.log('Original master promoted back to primary.');
    } catch (err) {
        console.error(`Error promoting original master: `, err);
    }
}

module.exports = { promoteReadReplica, checkMasterStatus, configureAsReplica, promoteOriginalMaster };