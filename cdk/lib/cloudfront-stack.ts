import {aws_s3, CfnOutput, Fn, RemovalPolicy, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import {CloudFrontAllowedMethods, OriginProtocolPolicy, OriginSslPolicy} from "aws-cdk-lib/aws-cloudfront";
import * as iam from "aws-cdk-lib/aws-iam";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import {API_GATEWAY_HOSTNAME, API_GATEWAY_STAGE_NAME} from "./lambda-with-gateway-stack";

export class CloudfrontStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const cloudfrontOAI = new cloudfront.OriginAccessIdentity(this, 'CloudfrontOAI', {
            comment: `oai for ${id}`
        });

        const assetBucket = new aws_s3.Bucket(this, 'AssetBucket', {
            bucketName: `${id}-asset-bucket`,
            publicReadAccess: false,
            blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
            removalPolicy: RemovalPolicy.DESTROY,
            autoDeleteObjects: true
        });

        assetBucket.addToResourcePolicy(new iam.PolicyStatement({
            actions: ['s3:GetObject'],
            resources: [assetBucket.arnForObjects('*')],
            principals: [new iam.CanonicalUserPrincipal(cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId)]
        }));
        new CfnOutput(this, 'Bucket', {value: assetBucket.bucketName});

        const distribution = new cloudfront.CloudFrontWebDistribution(this, 'CloudfrontDistribution', {
            defaultRootObject: '',
            originConfigs: [
                {
                    customOriginSource: {
                        originProtocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
                        allowedOriginSSLVersions: [OriginSslPolicy.TLS_V1_2],
                        domainName: Fn.importValue(API_GATEWAY_HOSTNAME),
                        originPath: `/${Fn.importValue(API_GATEWAY_STAGE_NAME)}`
                    },
                    behaviors: [{
                        isDefaultBehavior: true,
                        compress: true,
                        allowedMethods: CloudFrontAllowedMethods.ALL,
                    }]
                },
                {
                    s3OriginSource: {
                        s3BucketSource: assetBucket,
                        originAccessIdentity: cloudfrontOAI
                    },
                    behaviors: [{
                        pathPattern: 'build/*',
                        // isDefaultBehavior: true,
                        compress: true,
                        allowedMethods: CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
                    }]
                }
            ]
        });
        new CfnOutput(this, 'Cloudfront', {value: distribution.distributionDomainName});

        new s3deploy.BucketDeployment(this, 'AssetBucketDeployment', {
            sources: [s3deploy.Source.asset('../project/public/build')],
            destinationBucket: assetBucket,
            destinationKeyPrefix: 'build/',
            distribution,
            distributionPaths: ['/build/*'],
            prune: true
        });
    }
}
