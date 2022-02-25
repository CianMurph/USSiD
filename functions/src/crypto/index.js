const crypto = require('crypto')
const algorithm = 'aes-256-ctr';
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3';
const iv = crypto.randomBytes(16);

const encrypt = (text) => {

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    return {
        iv: iv.toString('hex'),
        content: encrypted.toString('hex')
    };
};

const decrypt = (hash) => {

    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));

    const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()]);

    return decrpyted.toString();
};

const hashfn = (index) => {
  hash = crypto.getHashes();
  
   // Create hash of SHA1 type
  //console.log(hash)
  // 'digest' is the output of hash function containing 
  // only hexadecimal digits
  hashIdx = crypto.createHash('sha1').update(index).digest('hex');

  return hashIdx;
}

exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.hash = hashfn;