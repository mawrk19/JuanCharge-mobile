
import * as jose from 'jose';
import crypto from 'crypto';

// KIOSK PRIVATE KEY (In production, this is stored SECURELY on the Kiosk Hardware)
const PRIVATE_KEY_PEM = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCwdlF7uzTu19qv
F0ODKdOXk1K5T3DsFjqCf626LU5vC/xpOtnGR010QzsxkxpVQVuolgSv0wAk9XV9
b1cOwXt3tZSefJ7qHKfMzx28iyzqT/ZoFK2qs5C3+IeLxvWGXzKnK4FXDS7Ssv1y
Z8vBS/DTaxVC2OoB5f2qhljsLCfvpU5tKPaWboejZTHXKXx/m42duEKuVGVkJI3G
CgEk3CWYS+G1Vx7QXifwmPm3afHKwoI/DTlNVuvf7az4XuHwYhSiq8m9/Ohj2TfA
cFVFrduBCNoq52CuI/RZw9A3BKiOv2Oq/3C/2K2v8Nw3/HGWhVgMN9XCjN3gE2CC
+gMvn5xJAgMBAAECggEAAvbMfJcS7GDM0rxsd7i3+KeoBTvWij3/V+98GWX8bMoX
QHnqwYqzZty1kv9vuvc2P8Pb//YRM7hkc6nEnRdWkxaw5ePy/ry3fC24cqZ7J9PA
Wv7fQerykdyHWQDhC+jvyWC7iJz3PeEgImVS8K7CtKfA+4FNlkro3WM/Usw/vtCR
WJuqfj8Qff3/S5zJVhReKtBPFRuJ8q6Uprlg9nja5056eD9vGovX17F51VLQ3kJN
btvZyf3x31zOqH0qENyG55LGyhmHS8N8Zj29CTKuFfLPRNDDHmFXT0xKIVHNRx/+
AVJTs8ORKSsEiowAFEi9a9dJqzjRKDhv1s1rQQGPgQKBgQDrh35CldGpR25y3kXh
jS3+Pi65vC/MpWp84OnuK1GeJTCYWx7RmUD4LaBcB48T2Rw3e2r4EE6DhJalQhgB
W9kvusa0x+fgERdSEubxV4Mh24B1VMxR4b+MGYkNxSStZ1sgS/FDStCznS/qqD0N
KoVkTWQbRHgfhARz5xop6mtFqQKBgQC/zJZU1PUQ9vYs3alc9upOGbMvjKUbYywr
zNEUXbJc7sYR4AlmS/CQB3/qb8qLN0JKB28ZFRiQDTMiiqMmB4xl6NxG30u0zumz
+bQxXYI29jat3fdqUBpff3XYH8zZuOflRSo7svtvxFeqYscxMcmuYzsYXQX3SYKG
7awhujiFoQKBgFxxuvnxifBSTCSj33PPEP1YdMiL94rwZiKLuOW1dPyIhlFWens0
Fs8SQX29rcfRkISqWWryI471bJeCoJ9v6IgWXEW6rOVCcA/TwXd6rMqOOBZVaTi+
TYt0vll8RpAVICxGAnUyGUZWbOdCj2vqg57BzYfyUN+11nWTgK5xBxe5AoGAH8Pc
afRTGhosr0WO1Sy3pXOwL4HVnnGQUTi8r+jMr4OEHlXCeMS+9LupPcSCAQiH3Abb
KYZK6SCmhWP8nUHGyOIGCV7WBP33yqziYQKhnESuzaDjZyIZHBPaCo9JuA1dqqUH
15dO+TXFZxyw7L7YLh+VG/XcFRaBnaMjTPqwfcECgYAMsqK8g2NI0O/7o2bYF7OR
C2lYTeGZLf8s9aF9LkhqFTP7u12kFeZiSGdZiKPtjgSSR7zo/oIb++nbsA/jAIxH
/OOcrcFkiBcBRP0OgNEuS0OPznOH0FIhHNxcpHcAx/y1Tc2yuR9/wREuRdCB3r8s
YaWMrXCx6i/MV70gEOhnNA==
-----END PRIVATE KEY-----`;

async function generateToken() {
    const args = process.argv.slice(2);
    const amount = args[0] ? parseInt(args[0]) : 623;

    try {
        const privateKey = await jose.importPKCS8(PRIVATE_KEY_PEM, 'RS256');

        const jwt = await new jose.SignJWT({
            action: 'store_points',
            amount: amount,
            timestamp: Date.now(),
            mock: true,
            nonce: crypto.randomUUID()
        })
            .setProtectedHeader({ alg: 'RS256' })
            .setIssuedAt()
            .setIssuer('kiosk-01')
            .setExpirationTime('2h')
            .sign(privateKey);

        console.log('\n>>> GENERATED SIGNED QR TOKEN <<<\n');
        console.log(jwt);
        console.log('\n==================================\n');
        console.log(`Payload: { action: 'store_points', amount: ${amount} }`);

    } catch (err) {
        console.error('Error generating token:', err);
    }
}

generateToken();
