#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {Stage} from 'aws-cdk-lib';
import {LambdaWithGatewayStack} from '../lib/lambda-with-gateway-stack';
import {CloudfrontStack} from "../lib/cloudfront-stack";
import {VpcStack} from "../lib/vpc-stack";
import {DbStack} from "../lib/db-stack";

const app = new cdk.App();
const stage = new Stage(app, 'BrefTestingStage', {
    env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION},
})

const vpcStack = new VpcStack(stage, 'vpcStack');

const dbStack = new DbStack(stage, 'dbStack', {
    vpc: vpcStack.vpc
});
dbStack.addDependency(vpcStack);

const lambdaWithGatewayStack = new LambdaWithGatewayStack(stage, 'lambdaStack', {
    vpc: vpcStack.vpc,
    db: dbStack.db,
});
lambdaWithGatewayStack.addDependency(vpcStack);
lambdaWithGatewayStack.addDependency(dbStack);

const cloudfrontStack = new CloudfrontStack(stage, 'cfStack');
cloudfrontStack.addDependency(vpcStack);
cloudfrontStack.addDependency(lambdaWithGatewayStack, 'Need ApiGateway hostname');
