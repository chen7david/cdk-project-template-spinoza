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

    const userGetOneLambda = new lambda.Function(this, 'get-one-users', {
      functionName: 'project-name-get-one-users',
      runtime: lambda.Runtime.NODEJS_18_X,
      code: new lambda.AssetCode('assets/dist'),
      handler: 'handlers/users/get-one.handler',
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
    const userGetOneResolver = new apigateway.LambdaIntegration(userGetOneLambda)
    const userGetAllResolver = new apigateway.LambdaIntegration(userGetAllLambda)

    usersRouteV1.addMethod('GET', userGetAllResolver, {
      operationName: 'GET all users',
      requestValidator: bodyAndParamValidator
    })

    userIdRouteV1.addMethod('GET', userGetOneResolver, {
      operationName: 'GET one user',
      requestValidator: bodyAndParamValidator
    })

    const usagePlan = api.addUsagePlan('UsagePlan', {
      name: 'spinoza-usage-plan',
      description: 'Enables rate and burst limiting for the api',
      apiStages: [{
        api: api,
        stage: api.deploymentStage
      }],
      quota: {
        limit: 1000,
        period: apigateway.Period.DAY
      },
      throttle: {
        rateLimit: 50,
        burstLimit: 2,
      },

    })

    const spinozaApikey = api.addApiKey('spinoza-api-key', {
      apiKeyName: 'spinoza',
      description: 'Apikey to required to access api'
    })

    usagePlan.addApiKey(spinozaApikey)
  }
}
