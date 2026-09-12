import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import * as path from 'path';

interface ApiStackProps extends cdk.StackProps {
  table: dynamodb.Table;
  userPool: cognito.UserPool;
}

export class ApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const env = { TICKETS_TABLE: props.table.tableName };
    const runtime = lambda.Runtime.NODEJS_20_X;

    function fn(scope: Construct, name: string, entry: string) {
      const f = new nodejs.NodejsFunction(scope, name, {
        runtime, entry: path.join(__dirname, '../../backend/functions', entry),
        environment: env,
        timeout: cdk.Duration.seconds(10),
        memorySize: 256,
        bundling: { minify: true, sourceMap: false },
      });
      props.table.grantReadWriteData(f);
      return f;
    }

    const createTicketFn     = fn(this, 'CreateTicketFn',     'createTicket/index.ts');
    const getTicketFn        = fn(this, 'GetTicketFn',        'getTicket/index.ts');
    const updateTicketFn     = fn(this, 'UpdateTicketFn',     'updateTicket/index.ts');
    const classifyFn         = fn(this, 'ClassifyFn',         'classifyRequest/index.ts');
    const syncFn             = fn(this, 'SyncFn',             'syncOfflineQueue/index.ts');
    const impactFn           = fn(this, 'ImpactFn',           'getImpactMetrics/index.ts');

    // Health check — no auth, no DB
    const healthFn = new lambda.Function(this, 'HealthFn', {
      runtime, code: lambda.Code.fromInline(`exports.handler = async () => ({ statusCode: 200, body: JSON.stringify({ status: 'ok' }) })`),
      handler: 'index.handler',
    });

    // Cognito authorizer
    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'Authorizer', {
      cognitoUserPools: [props.userPool],
    });
    const auth = { authorizer, authorizationType: apigateway.AuthorizationType.COGNITO };

    const api = new apigateway.RestApi(this, 'ICSApi', {
      restApiName: `ics-api-${this.node.tryGetContext('env') ?? 'dev'}`,
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET','POST','PATCH','OPTIONS'],
        allowHeaders: ['Content-Type','Authorization','X-Idempotency-Key'],
      },
    });

    const tickets = api.root.addResource('tickets');
    tickets.addMethod('POST', new apigateway.LambdaIntegration(createTicketFn), auth);

    const ticket = tickets.addResource('{ticketId}');
    ticket.addMethod('GET',   new apigateway.LambdaIntegration(getTicketFn),    auth);
    ticket.addMethod('PATCH', new apigateway.LambdaIntegration(updateTicketFn), auth);

    const classify = api.root.addResource('classify');
    classify.addMethod('POST', new apigateway.LambdaIntegration(classifyFn), auth);

    const sync = api.root.addResource('sync');
    sync.addMethod('POST', new apigateway.LambdaIntegration(syncFn), auth);

    const impact = api.root.addResource('impact');
    impact.addMethod('GET', new apigateway.LambdaIntegration(impactFn));

    const health = api.root.addResource('health');
    health.addMethod('GET', new apigateway.LambdaIntegration(healthFn));

    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
  }
}
