import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /* Lambda layer */

    const layer = new lambda.LayerVersion(this, 'node-modules-layer', {
      layerVersionName: 'entix-node-modules-layer',
      compatibleRuntimes: [
        lambda.Runtime.NODEJS_18_X,
      ],
      code: lambda.Code.fromAsset('assets/layer.zip'),
      description: 'lambda layer for external npm dependencies',
    })

    /* Lambda */

    const userGetAllLambda = new lambda.Function(this, 'get-all-users', {
      functionName: 'project-name-get-all-users',
      runtime: lambda.Runtime.NODEJS_18_X,
      code: new lambda.AssetCode('assets/dist'),
      handler: 'handlers/users/get-all.handler',
      layers: [layer]
    })

    /* ApiGatewat */

    const api = new apigateway.RestApi(this, 'SpinozaApigateway', {
      restApiName: 'spinoza-apigateway',
      description: 'exposes a rest api for Spinoza services',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      }
    })

  }
}
