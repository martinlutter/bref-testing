import {AssetHashType, CfnOutput, Duration, Fn, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import {MethodLoggingLevel} from 'aws-cdk-lib/aws-apigateway';
import {IVpc, Port} from "aws-cdk-lib/aws-ec2";
import {IServerlessCluster, ServerlessCluster} from "aws-cdk-lib/aws-rds";

export const API_GATEWAY_HOSTNAME = 'ApiGatewayHostname';
export const API_GATEWAY_STAGE_NAME = 'ApiGatewayStageName';

interface LambdaStackProps extends StackProps {
    readonly vpc: IVpc;
    readonly db: ServerlessCluster;
}

export class LambdaWithGatewayStack extends Stack {
    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        const phpLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'LambdaPhp81Layer', 'arn:aws:lambda:eu-central-1:209497400698:layer:php-81-fpm:17');
        const lambdaEnv = {
            DATABASE_URL: `postgresql://brefroot:kappa123@${props.db.clusterEndpoint.socketAddress}/bref?serverVersion=10&charset=utf8`
        };

        const fpmLambda = new lambda.Function(this, 'FpmFunction', {
            runtime: lambda.Runtime.PROVIDED_AL2,
            code: lambda.Code.fromAsset('symfony_src.zip', {
                assetHashType: AssetHashType.SOURCE
            }),
            handler: 'public/index.php',
            layers: [phpLayer],
            timeout: Duration.seconds(29),
            memorySize: 512,
            vpc: props.vpc,
            vpcSubnets: {onePerAz: true},
            environment: lambdaEnv
        });
        const consoleLambda = new lambda.Function(this, 'ConsoleFunction', {
            runtime: lambda.Runtime.PROVIDED_AL2,
            code: lambda.Code.fromAsset('symfony_src.zip', {
                assetHashType: AssetHashType.SOURCE
            }),
            handler: 'bin/console',
            layers: [
                phpLayer,
                lambda.LayerVersion.fromLayerVersionArn(this, 'LambdaConsoleLayer', 'arn:aws:lambda:eu-central-1:209497400698:layer:console:56')
            ],
            timeout: Duration.minutes(2),   //30
            memorySize: 512,
            vpc: props.vpc,
            vpcSubnets: {onePerAz: true},
            environment: lambdaEnv
        });

        props.db.connections.allowFrom(fpmLambda, Port.tcp(props.db.clusterEndpoint.port));
        props.db.connections.allowFrom(consoleLambda, Port.tcp(props.db.clusterEndpoint.port));

        const apiGateway = new apigateway.LambdaRestApi(this, 'Api', {
            handler: fpmLambda,
            endpointTypes: [apigateway.EndpointType.REGIONAL],
            deployOptions: {
                loggingLevel: MethodLoggingLevel.INFO,
            },
        });

        new CfnOutput(this, API_GATEWAY_HOSTNAME, {
            value: Fn.join('.', [apiGateway.restApiId, 'execute-api.eu-central-1.amazonaws.com']),
            exportName: API_GATEWAY_HOSTNAME,
        });
        new CfnOutput(this, API_GATEWAY_STAGE_NAME, {
            value: apiGateway.deploymentStage.stageName,
            exportName: API_GATEWAY_STAGE_NAME,
        });
    }
}
