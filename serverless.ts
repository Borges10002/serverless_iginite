import type { AWS } from "@serverless/typescript";

const serverlessConfiguration: AWS = {
  service: "serverless_iginite",
  frameworkVersion: "3",
  plugins: [
    "serverless-esbuild",
    "serverless-dynamodb-local",
    "serverless-offline",
  ],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    region: "us-east-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
    },
    lambdaHashingVersion: "20201221",
    iamRoleStatements: [
      {
        Effect: "Allow",
        Action: ["dynamodb"],
        Resource: ["*"],
      },
      {
        Effect: "Allow",
        Action: ["s3:*"],
        Resource: ["*"],
      },
    ],
  },
  // import the function via paths
  package: { individually: false },
  functions: {
    taskCreate: {
      handler: "src/functions/taskCreate.handle",
      events: [
        {
          http: {
            path: "todos/{id}",
            method: "post",
            cors: true,
          },
        },
      ],
    },
    taskGetByUserId: {
      handler: "src/functions/taskGetByUserId.handle",
      events: [
        {
          http: {
            path: "todos/{id}",
            method: "get",
            cors: true,
          },
        },
      ],
    },
  },

  custom: {
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
      concurrency: 10,
      external: ["chrome-aws-lambda"],
    },
    dynamodb: {
      stages: ["dev", "local"],
      start: {
        port: 8000,
        inMemory: true,
        migrate: true,
      },
    },
  },

  resources: {
    Resources: {
      dbCertificateUsers: {
        Type: "AWS::DynamoDB::Table",
        Properties: {
          TableName: "users_iginite",
          ProvisionedThroghput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
          AttributeDefinitions: [
            {
              AttributeName: "id",
              AttributeType: "S",
            },
          ],
          KeySchema: [
            {
              AttributeName: "id",
              KeyType: "HASH",
            },
          ],
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
