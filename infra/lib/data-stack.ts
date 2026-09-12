import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

/**
 * DynamoDB table for tickets.
 *
 * Access patterns:
 *   1. Get ticket by ID            → PK=TICKET#<id>, SK=METADATA
 *   2. List student tickets        → GSI1: PK=STUDENT#<id>, SK begins_with CREATED#
 *   3. List tickets by department  → GSI2: PK=DEPARTMENT#<dept>, SK begins_with STATUS#
 *   4. Idempotency check           → PK=IDEMPOTENCY#<key>, SK=KEY  (TTL=7d)
 */
export class DataStack extends cdk.Stack {
  public readonly table: dynamodb.Table;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    this.table = new dynamodb.Table(this, 'TicketsTable', {
      tableName: `ics-tickets-${this.node.tryGetContext('env') ?? 'dev'}`,
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey:      { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode:  dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      // Point-in-time recovery for production
      pointInTimeRecovery: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // GSI1: student queries
    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey:      { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
    });

    // GSI2: staff/department queries
    this.table.addGlobalSecondaryIndex({
      indexName: 'GSI2',
      partitionKey: { name: 'GSI2PK', type: dynamodb.AttributeType.STRING },
      sortKey:      { name: 'GSI2SK', type: dynamodb.AttributeType.STRING },
    });

    new cdk.CfnOutput(this, 'TableName', { value: this.table.tableName });
  }
}
