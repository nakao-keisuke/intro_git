import crypto from 'node:crypto';

const SECRET_KEY = import.meta.env.ENCRYPTION_KEY as string;
// 暗号化アルゴリズム
const CIPHER_ALGORITHM = 'aes-256-cbc';
// 初期化ベクトルの長さ（16バイト）
const IV_LENGTH = 16;

export function encryptBySha1(data: string): string {
  const digest = crypto.createHash('sha1');
  const bytes = Buffer.from(data, 'utf8');
  digest.update(bytes);
  return digest.digest('hex');
}

export function encryptBySha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function encrypt(data: string): string {
  // 初期化ベクトルをランダムに生成
  const iv = crypto.randomBytes(IV_LENGTH);
  // 暗号化器を作成
  const cipher = crypto.createCipheriv(
    CIPHER_ALGORITHM,
    Buffer.from(SECRET_KEY),
    iv,
  );
  // データを暗号化
  const encrypted = cipher.update(data);
  const final = cipher.final();
  const encryptedData = Buffer.concat([encrypted, final]);
  // 初期化ベクトルと暗号化されたデータを連結してBase64エンコードした文字列を返す
  return `${iv.toString('base64')}:${encryptedData.toString('base64')}`;
}
/**
 * 暗号化されたデータを復号する
 * @param encryptedData 暗号化されたデータ
 * @returns 復号された文字列
 */
export function decrypt(encryptedData: string): string {
  // 初期化ベクトルと暗号化されたデータを分割する
  const [ivString, encryptedString] = encryptedData.split(':');
  // 初期化ベクトルをBase64デコードしてBufferに変換
  const iv = Buffer.from(ivString!, 'base64');
  // 暗号化器を作成
  const decipher = crypto.createDecipheriv(
    CIPHER_ALGORITHM,
    Buffer.from(SECRET_KEY),
    iv,
  );
  // 暗号化されたデータをBufferに変換
  const encryptedDataBuffer = Buffer.from(encryptedString!, 'base64');
  // データを復号
  const decrypted = decipher.update(encryptedDataBuffer);
  const final = decipher.final();
  const decryptedData = Buffer.concat([decrypted, final]);
  // 復号されたデータを返す
  return decryptedData.toString();
}
