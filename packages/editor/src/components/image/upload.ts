import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const cdnhost = 'doc-cdn.zsedc800.com';

const Bucket = 'docucraft';
const keyPrefix = 'resources';

// // 自定义 HTTP 处理器以跟踪上传进度
// const customFetchHttpHandler = new FetchHttpHandler({
//   requestHandlerOptions: {
//     onUploadProgress: (event: ProgressEvent) => {
//       if (event.lengthComputable) {
//         const percentage = Math.round((event.loaded / event.total) * 100);
//         console.log(`Uploaded: ${percentage}%`);
//         // 在这里更新进度条 UI
//       }
//     },
//   },
// });

const s3Client = new S3Client({
	region: 'auto',
	endpoint: '',
	credentials: {
		accessKeyId: '',
		secretAccessKey: ''
	}
});

async function uploadToS3(file: File) {
	const key = keyPrefix + '/' + file.name;

	const command = new PutObjectCommand({ Bucket, Key: key, Body: file });

	try {
		const res = await s3Client.send(command);
	} catch (error) {}

	return `https://${cdnhost}/${key}`;
}

export default async (file: File) => {
	// return uploadToS3(file);
};
