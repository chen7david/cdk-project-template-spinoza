import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const layer = new lambda.LayerVersion(this, 'node-modules-layer', {
      layerVersionName: 'entix-node-modules-layer',
      compatibleRuntimes: [
        lambda.Runtime.NODEJS_18_X,
      ],
      code: lambda.Code.fromAsset('assets/layer.zip'),
      description: 'lambda layer for external npm dependencies',
    })

    const userGetAllLambda = new lambda.Function(this, 'get-all-users', {
      functionName: 'project-name-get-all-users',
      runtime: lambda.Runtime.NODEJS_18_X,
      layers: [layer],
      code: new lambda.AssetCode('assets/dist'),
      handler: 'handlers/users/get-all.handler',
      reservedConcurrentExecutions: 1
    })

  }
}
