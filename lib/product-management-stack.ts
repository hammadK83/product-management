import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2_integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambdaRuntime from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as path from 'path';
import { create } from 'domain';
import { HttpMethod } from 'aws-cdk-lib/aws-events';

export class ProductManagementStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table for products
    const productsTable = new dynamodb.Table(this, `${this.stackName}-Products-Table`, {
      tableName: `${this.stackName}-Products-Table`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    })

    // Create S3 bucket for product images
    const productImagesBucket = new s3.Bucket(this, `${this.stackName}-Product-Images-Bucket`, {
      bucketName: `${this.stackName.toLowerCase()}-product-images-s3-bucket`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // Create lambda functions for handling HTTP requests
    const createProductLambda = new NodejsFunction(this, `${this.stackName}-Create-Product-Lambda`, {
      functionName: `${this.stackName}-Create-Product_lambda`,
      runtime: lambdaRuntime.Runtime.NODEJS_24_X,
      handler: 'handler',
      entry: path.join(__dirname, '../src/lambda/products/createProduct.ts'),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        IMAGES_BUCKET_NAME: productImagesBucket.bucketName,
      },
      timeout: cdk.Duration.seconds(60),
    })

    const getAllProductsLambda = new NodejsFunction(this, `${this.stackName}-Get-All-Products-Lambda`, {
      functionName: `${this.stackName}-Get-All-Products_Lambda`,
      runtime: lambdaRuntime.Runtime.NODEJS_24_X,
      handler: 'handler',
      entry: path.join(__dirname, '../src/lambda/products/getAllProducts.ts'),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
      },
    })

    const deleteProductLambda = new NodejsFunction(this, `${this.stackName}-Delete-Product-Lambda`, {
      functionName: `${this.stackName}-Delete-Product-Lambda`,
      runtime: lambdaRuntime.Runtime.NODEJS_24_X,
      handler: 'handler',
      entry: path.join(__dirname, '../src/lambda/products/deleteProduct.ts'),
      environment: {
        PRODUCTS_TABLE_NAME: productsTable.tableName,
        IMAGES_BUCKET_NAME: productImagesBucket.bucketName,
      },
    })

    // Grant Permissions to lambda functions
    productsTable.grantWriteData(createProductLambda)
    productsTable.grantReadData(getAllProductsLambda)
    productsTable.grantReadWriteData(deleteProductLambda)

    // Grant S3 bucket permissions
    productImagesBucket.grantWrite(createProductLambda)
    productImagesBucket.grantWrite(deleteProductLambda)

    // Create Http API
    const productsApi = new apigatewayv2.HttpApi(this, `${this.stackName}-Products-API`, {
      apiName: `${this.stackName}-Products-API`,
    })

    // Add products routes
    productsApi.addRoutes({
      path: '/products',
      methods: [apigatewayv2.HttpMethod.POST],
      integration: new apigatewayv2_integrations.HttpLambdaIntegration(
        'CreateProductIntegration',
        createProductLambda
      ),
    })

    productsApi.addRoutes({
      path: "/products",
      methods: [apigatewayv2.HttpMethod.GET],
      integration: new apigatewayv2_integrations.HttpLambdaIntegration(
        'GetAllProductsIntegration',
        getAllProductsLambda
      ),
    })

    productsApi.addRoutes({
      path: "/products/{id}",
      methods: [apigatewayv2.HttpMethod.DELETE],
      integration: new apigatewayv2_integrations.HttpLambdaIntegration(
        'DeleteProductIntegration',
        deleteProductLambda
      ),
    })

    // Outputs
    new cdk.CfnOutput(this, 'ProductsTableName', {
      value: productsTable.tableName,
      description: 'DynamoDB Table Name for the Products Table',
      exportName: `${this.stackName}-Products-Table-Name`,
    })

    new cdk.CfnOutput(this, 'ProductImagesBucketName', {
      value: productImagesBucket.bucketName,
      description: 'S3 Bucket Name for the Product Images Bucket',
      exportName: `${this.stackName}-Product-Images-Bucket-Name`,
    })

    new cdk.CfnOutput(this, 'ProductsApiUrl', {
      value: productsApi.url ?? '',
      description: 'API Gateway URL for the Products API',
      exportName: `${this.stackName}-Products-API-Url`,
    })
  }
}
