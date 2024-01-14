import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import * as apigateway from 'aws-cdk-lib/aws-apigateway'
import * as cognito from 'aws-cdk-lib/aws-cognito'

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /* Cognito */
    const userPool = new cognito.UserPool(this, 'cdk-spinoza-user-pool', {
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,
      userVerification: {
        emailStyle: cognito.VerificationEmailStyle.CODE
      },
      autoVerify: {
        email: true
      },
      standardAttributes: {
        email: {
          required: true,
          mutable: true
        }
      }
    })

    const userPoolClient = userPool.addClient('app-client', 
     {
        oAuth: {
          flows : {
            implicitCodeGrant: true
          },
          scopes: [cognito.OAuthScope.OPENID],
          callbackUrls: ['https://www.google.com']
        }
      }
    )

    /* Dynamodb table */

    const table = new dynamodb.Table(this, 'spinoza-proj-table', {
      tableName: 'spinoza-proj-table',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'pk',
        type: dynamodb.AttributeType.STRING
      },
      sortKey: {
        name: 'sk',
        type: dynamodb.AttributeType.STRING
      },
    })

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
    const commonLambdaProps = {
      runtime: lambda.Runtime.NODEJS_18_X,
      memorySize: 256,
      timeout: cdk.Duration.seconds(30)
    }

    const userGetAllLambda = new lambda.Function(this, 'users-get-all', {
      ...commonLambdaProps,
      functionName: 'project-name-users-get-all',
      code: new lambda.AssetCode('assets/dist'),
      handler: 'handlers/users/get-all.handler',
      layers: [layer],
      environment: {
        TABLE_NAME: table.tableName
      },
    })

    const userGetOneLambda = new lambda.Function(this, 'users-get-one', {
      ...commonLambdaProps,
      functionName: 'project-name-users-get-one',
      code: new lambda.AssetCode('assets/dist'),
      handler: 'handlers/users/get-one.handler',
      layers: [layer],
      environment: {
        TABLE_NAME: table.tableName
      },
    })

    const userCreateOneLambda = new lambda.Function(this, 'users-create-one', {
      ...commonLambdaProps,
      functionName: 'project-name-users-create-one',
      code: new lambda.AssetCode('assets/dist'),
      handler: 'handlers/users/create-one.handler',
      layers: [layer],
      environment: {
        TABLE_NAME: table.tableName
      },
    })

    const userPutOneLambda = new lambda.Function(this, 'users-put-one', {
      ...commonLambdaProps,
      functionName: 'project-name-users-put-one',
      code: new lambda.AssetCode('assets/dist'),
      handler: 'handlers/users/put-one.handler',
      layers: [layer],
      environment: {
        TABLE_NAME: table.tableName
      },
    })

    const userDeleteOneLambda = new lambda.Function(this, 'users-delete-one', {
      ...commonLambdaProps,
      functionName: 'project-name-users-delete-one',
      code: new lambda.AssetCode('assets/dist'),
      handler: 'handlers/users/delete-one.handler',
      layers: [layer],
      environment: {
        TABLE_NAME: table.tableName
      },
    })

    /* ApiGatewat */
    table.grantReadData(userGetAllLambda)
    table.grantReadData(userGetOneLambda)
    table.grantWriteData(userCreateOneLambda)
    table.grantWriteData(userPutOneLambda)
    table.grantFullAccess(userDeleteOneLambda)

    /* ApiGatewat */

    const api = new apigateway.RestApi(this, 'SpinozaApigateway', {
      restApiName: 'spinoza-apigateway',
      description: 'exposes a rest api for Spinoza services',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE'],
      }
    })

    const cognitoAutherizer = new apigateway.CfnAuthorizer(this, 'spinoza-autherizer', {
      restApiId: api.restApiId,
      name: 'CognitoAuthorizer',
      type: 'COGNITO_USER_POOLS',
      identitySource: 'method.request.header.Authorization',
      providerArns: [userPool.userPoolArn],
    })

    /* Setup ApiGateway Routes */

    const rootApiRouteV1 = api.root.addResource('v1')
    const groupsRouteV1 = rootApiRouteV1.addResource('groups')
    const groupIdRouteV1 = groupsRouteV1.addResource('{group_id}')
    const usersRouteV1 = groupIdRouteV1.addResource('users')
    const userIdRouteV1 = usersRouteV1.addResource('{user_id}')

    /* Setup Route RequestValidators */

    const bodyAndParamValidator = new apigateway.RequestValidator(this, 'ApiBodyAndParamValidator', {
      restApi: api,
      requestValidatorName: 'api-body-and-param-validator',
      validateRequestBody: true,
      validateRequestParameters: true,
    })

    /* Create lambda ApiGateway integrations */
    const userGetOneResolver = new apigateway.LambdaIntegration(userGetOneLambda)
    const userGetAllResolver = new apigateway.LambdaIntegration(userGetAllLambda)
    const userCreateOneResolver = new apigateway.LambdaIntegration(userCreateOneLambda)
    const userPutOneResolver = new apigateway.LambdaIntegration(userPutOneLambda)
    const userDeleteOneResolver = new apigateway.LambdaIntegration(userDeleteOneLambda)

    usersRouteV1.addMethod('GET', userGetAllResolver, {
      operationName: 'GET all users',
      requestValidator: bodyAndParamValidator,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: cognitoAutherizer.ref
      }
    })

    userIdRouteV1.addMethod('GET', userGetOneResolver, {
      operationName: 'GET one user',
      requestValidator: bodyAndParamValidator,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: cognitoAutherizer.ref
      }
    })

    userIdRouteV1.addMethod('POST', userCreateOneResolver, {
      operationName: 'POST one user',
      requestValidator: bodyAndParamValidator,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: cognitoAutherizer.ref
      }
    })

    userIdRouteV1.addMethod('PUT', userPutOneResolver, {
      operationName: 'PUT one user',
      requestValidator: bodyAndParamValidator
    })

    userIdRouteV1.addMethod('DELETE', userDeleteOneResolver, {
      operationName: 'PUT one user',
      requestValidator: bodyAndParamValidator,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: cognitoAutherizer.ref
      }
    })
  }
}
