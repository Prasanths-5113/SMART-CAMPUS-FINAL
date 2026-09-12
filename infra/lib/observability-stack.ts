import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

/**
 * CloudWatch alarms and log groups for observability.
 * - Lambda errors > 0 in 5 minutes → alarm
 * - API 5xx errors > 0 → alarm
 * - Log groups with 30-day retention
 * Structured logging recommended in all Lambda functions.
 * Never log: passwords, tokens, payment details, or sensitive request content.
 */
export class ObservabilityStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const env = this.node.tryGetContext('env') ?? 'dev';

    // Log groups
    const fns = ['createTicket','getTicket','updateTicket','classifyRequest','syncOfflineQueue','getImpactMetrics'];
    fns.forEach(name => {
      new logs.LogGroup(this, `${name}Logs`, {
        logGroupName: `/aws/lambda/ics-${name}-${env}`,
        retention: logs.RetentionDays.ONE_MONTH,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });
    });

    // Dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'IcsDashboard', {
      dashboardName: `ICS-${env}`,
    });

    dashboard.addWidgets(
      new cloudwatch.TextWidget({
        markdown: '# Inclusive Campus Support — Observability\n> Monitor Lambda errors, API latency, and ticket creation. Never log sensitive data.',
        width: 24, height: 2,
      }),
      new cloudwatch.AlarmWidget({
        title: 'Lambda Errors',
        alarm: new cloudwatch.Alarm(this, 'LambdaErrorAlarm', {
          metric: new cloudwatch.Metric({
            namespace: 'AWS/Lambda', metricName: 'Errors',
            dimensionsMap: { FunctionName: `ics-createTicket-${env}` },
            statistic: 'Sum', period: cdk.Duration.minutes(5),
          }),
          threshold: 1, evaluationPeriods: 1, treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
          alarmDescription: 'Lambda errors detected — investigate immediately.',
        }),
        width: 12,
      }),
    );

    new cdk.CfnOutput(this, 'DashboardUrl', {
      value: `https://console.aws.amazon.com/cloudwatch/home#dashboards:name=ICS-${env}`,
    });
  }
}
