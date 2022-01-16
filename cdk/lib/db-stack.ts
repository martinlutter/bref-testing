import {Duration, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {
    AuroraCapacityUnit,
    AuroraPostgresEngineVersion,
    Credentials,
    DatabaseClusterEngine,
    DatabaseSecret,
    ServerlessCluster
} from "aws-cdk-lib/aws-rds";
import {IVpc, SubnetType} from "aws-cdk-lib/aws-ec2";

interface DbStackProps extends StackProps {
    readonly vpc: IVpc
}

export class DbStack extends Stack {
    readonly db: ServerlessCluster

    constructor(scope: Construct, id: string, props: DbStackProps) {
        super(scope, id, props);

        const dbCredentials = new DatabaseSecret(this, 'DbSecret', {
            secretName: `${id}/rds/creds/bref`.toLowerCase(),
            username: 'brefroot',
        });

        this.db = new ServerlessCluster(this, 'DbCluster', {
            vpc: props.vpc,
            vpcSubnets: {
                subnetType: SubnetType.PRIVATE_WITH_NAT,
            },
            defaultDatabaseName: 'bref',
            engine: DatabaseClusterEngine.auroraPostgres({version: AuroraPostgresEngineVersion.VER_10_14}),
            credentials: Credentials.fromSecret(dbCredentials),
            scaling: {
                maxCapacity: AuroraCapacityUnit.ACU_2,
                autoPause: Duration.minutes(5),
            },
        });
    }
}
