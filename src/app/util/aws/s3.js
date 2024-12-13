import AWS from 'aws-sdk';
import config from '../../config';

const awsS3EncryptionAlgorithm = 'AES256';

export function getS3() {
  return new AWS.S3({
    apiVersion: '2006-03-01',
    region: config.aws.s3.region,
    params: {
      Bucket: config.aws.s3.bucket,
    },
  });
}

export function uploadFile(filename, file, encryptionKey = '') {
  console.log(`S3 Upload ::: Start => ${filename}`);

  const params = {
    Key: filename,
    Body: file,
    ContenType: file.type || '',
  };

  if(encryptionKey) {
    params.SSECustomerAlgorithm = awsS3EncryptionAlgorithm;
    params.SSECustomerKey = encryptionKey; /* Strings will be Base-64 encoded on your behalf */
    params.SSECustomerKeyMD5 = AWS.util.crypto.md5(encryptionKey); // md5(encryptionKey); // Generate md5 hash of encryptionKey
  }
  return getS3()
    .upload(params)
    .promise();
}

export function getFile(filename, encryptionKey = '') {
  const params = {
    Key: filename,
  };

  if(encryptionKey) {
    params.SSECustomerAlgorithm = awsS3EncryptionAlgorithm;
    params.SSECustomerKey = encryptionKey; /* Strings will be Base-64 encoded on your behalf */
    params.SSECustomerKeyMD5 = AWS.util.crypto.md5(encryptionKey); // md5(encryptionKey); // Generate md5 hash of encryptionKey
  }
  return getS3()
    .getObject(params)
    .promise();
}

export function listFiles(path) {
  return getS3()
    .listObjects({ Prefix: path })
    .promise();
}

export function copyFile(
  sourceFile,
  destination,
  isDistinctSourceBucket = false
) {
  const params = {
    CopySource: `${
      isDistinctSourceBucket ? '' : `/${config.aws.s3.bucket}`
    }/${sourceFile}`,
    Key: destination,
  };
  return getS3()
    .copyObject(params)
    .promise();
}

export function deleteFile(path) {
  return getS3()
    .deleteObject({ Key: path })
    .promise();
}
