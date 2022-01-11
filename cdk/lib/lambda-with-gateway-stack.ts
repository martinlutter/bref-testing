import {AssetHashType, CfnOutput, Duration, Fn, Stack, StackProps} from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import {MethodLoggingLevel} from 'aws-cdk-lib/aws-apigateway';

export const API_GATEWAY_HOSTNAME = 'ApiGatewayHostname';
export const API_GATEWAY_STAGE_NAME = 'ApiGatewayStageName';

export class LambdaWithGatewayStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const phpLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'lambda-php81-runtime', 'arn:aws:lambda:eu-central-1:209497400698:layer:php-81-fpm:17');
        const fpmLambda = new lambda.Function(this, 'BrefFpmFunction', {
            runtime: lambda.Runtime.PROVIDED_AL2,
            code: lambda.Code.fromAsset('symfony_src.zip', {
                assetHashType: AssetHashType.SOURCE
            }),
            handler: 'public/index.php',
            layers: [phpLayer],
            timeout: Duration.seconds(29),
            memorySize: 512,
        });
        const consoleLambda = new lambda.Function(this, 'BrefConsoleFunction', {
            runtime: lambda.Runtime.PROVIDED_AL2,
            code: lambda.Code.fromAsset('symfony_src.zip', {
                assetHashType: AssetHashType.SOURCE
            }),
            handler: 'bin/console',
            layers: [
                phpLayer,
                lambda.LayerVersion.fromLayerVersionArn(this, 'lambda-console', 'arn:aws:lambda:eu-central-1:209497400698:layer:console:56')
            ],
            timeout: Duration.minutes(2),   //30
            memorySize: 512,
        });

        const apiGateway = new apigateway.LambdaRestApi(this, 'bref-testing-api', {
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
