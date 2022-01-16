import {Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {IVpc, SubnetType, Vpc} from "aws-cdk-lib/aws-ec2";

export class VpcStack extends Stack {
    readonly vpc: IVpc

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.vpc = new Vpc(this, 'Vpc', {
            cidr: '10.0.0.0/16',
            natGateways: 1,
            maxAzs: 3,
            subnetConfiguration: [
                {
                    name: 'private',
                    subnetType: SubnetType.PRIVATE_WITH_NAT,
                    cidrMask: 24,
                },
                {
                    name: 'public',
                    subnetType: SubnetType.PUBLIC,
                    cidrMask: 24,
                }
            ]
        });
    }
}
