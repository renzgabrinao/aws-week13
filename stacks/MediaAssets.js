import { Bucket } from "sst/constructs";
import cdk from "aws-cdk-lib";

export function MediaAssets({ stack, app }) {
  const bucket = new Bucket(stack, "Uploads", {
    cdk: {
      bucket: {
        autoDeleteObjects: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
    },
    cors: [
      {
        maxAge: "1 day",
        allowedOrigins: ["*"],
        allowedHeaders: ["*"],
        allowedMethods: ["GET", "PUT", "POST", "DELETE", "HEAD"],
      },
    ],
  });

  stack.addOutputs({
    BucketName: bucket.bucketName,
  });

  return {
    bucket,
  };
}
