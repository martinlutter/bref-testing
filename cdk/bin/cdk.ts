#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LambdaWithGatewayStack } from '../lib/lambda-with-gateway-stack';
import {CloudfrontStack} from "../lib/cloudfront-stack";
import {Stage} from "aws-cdk-lib";
import {URL} from "url";

const app = new cdk.App();
const stage = new Stage(app, 'BrefTestingStage', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
})

const lambdaWithGatewayStack = new LambdaWithGatewayStack(stage, 'BrefTestingLambdaWithGatewayStack');
const cloudfrontStack = new CloudfrontStack(stage, 'BrefTestingCloudfrontStack');
cloudfrontStack.addDependency(lambdaWithGatewayStack, 'Need ApiGateway hostname');
