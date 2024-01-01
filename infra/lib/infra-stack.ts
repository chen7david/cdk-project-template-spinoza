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

    const userFindAllLambda = new lambda.Function(this, 'find-all-users', {
      functionName: 'project-name-get-all-users',
      runtime: lambda.Runtime.NODEJS_18_X,
      code: new lambda.AssetCode('assets/dist'),
      handler: 'handlers/users/get-all.handler',
      reservedConcurrentExecutions: 1, // Maximum amount of lambdas allowed to run
      layers: [layer]
    })

    const userFindOneLambda = new lambda.Function(this, 'find-all-users', {
      functionName: 'project-name-get-all-users',
      runtime: lambda.Runtime.NODEJS_18_X,
      code: new lambda.AssetCode('assets/dist'),
      handler: 'handlers/users/get-one.handler',
      reservedConcurrentExecutions: 1,
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

    /* Setup ApiGateway Routes */

    const rootApiRouteV1 = api.root.addResource('v1')
    const usersRouteV1 = rootApiRouteV1.addResource('users')
    const userIdRouteV1 = usersRouteV1.addResource('{user_id}')

    /* Setup Route RequestValidators */

    const bodyAndParamValidator = new apigateway.RequestValidator(this, 'ApiBodyAndParamValidator', {
      restApi: api,
      requestValidatorName: 'api-body-and-param-validator',
      validateRequestBody: true,
      validateRequestParameters: true
    })

    /* Create lambda ApiGateway integrations */
    const userFindOneResolver = new apigateway.LambdaIntegration(userFindOneLambda)
    const userFindAllResolver = new apigateway.LambdaIntegration(userFindAllLambda)

    usersRouteV1.addMethod('GET', userFindAllResolver, {
      operationName: 'GET all users',
      requestValidator: bodyAndParamValidator
    })

    userIdRouteV1.addMethod('GET', userFindOneResolver, {
      operationName: 'GET one user',
      requestValidator: bodyAndParamValidator
    })
  }
}
