#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DataStack }          from '../lib/data-stack';
import { AuthStack }          from '../lib/auth-stack';
import { ApiStack }           from '../lib/api-stack';
import { FrontendStack }      from '../lib/frontend-stack';
import { ObservabilityStack } from '../lib/observability-stack';

const app = new cdk.App();
const env = { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION ?? 'ap-south-1' };
const ctx = { env: app.node.tryGetContext('env') ?? 'dev' };

const data    = new DataStack(app, `ICS-Data-${ctx.env}`,          { env });
const auth    = new AuthStack(app, `ICS-Auth-${ctx.env}`,          { env });
const api     = new ApiStack(app,  `ICS-Api-${ctx.env}`,           { env, table: data.table, userPool: auth.userPool });
new FrontendStack(app,      `ICS-Frontend-${ctx.env}`,             { env });
new ObservabilityStack(app, `ICS-Observability-${ctx.env}`,        { env });

// Cross-stack dependency
api.addDependency(data);
api.addDependency(auth);
