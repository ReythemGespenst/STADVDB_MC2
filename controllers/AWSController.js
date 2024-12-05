const {RDSClient, PromoteReadReplicaCommand, DescribeDBInstancesCommand} = require('@aws-sdk/client-rds');

const rdsClient = new RDSClient({
    region: ,
    credentials: {

    }
});

async function promoteReadReplica(dbInstanceIdentifier) {
    try {
        const command = new PromoteReadReplicaCommand({
            dbInstanceIdentifier: dbInstanceIdentifier,
        });

        const data = rdsClient.send(command);
        console.log(`Successfully promoted the read replica: `, data);
    } catch (err){
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
  
const readReplicaIdentifier = 'dunno yet, waiting for Tim';

setInterval(async () => {
    const status = await checkMasterStatus('master_instance_idk yet coz tim not awake yet');
    if (status != 'available'){
        console.log('Master instance is down. Initiating failover...');
        promoteReadReplica(readReplicaIdentifier);
    }
}, 60000);