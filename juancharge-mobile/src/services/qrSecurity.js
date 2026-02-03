import * as jose from "jose";

// PUBLIC KEY (In production, this should be properly managed/rotated)
// This verifies that the QR code was signed by a valid Kiosk Private Key
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsHZRe7s07tfarxdDgynT
l5NSuU9w7BY6gn+tui1Obwv8aTrZxkdNdEM7MZMaVUFbqJYEr9MAJPV1fW9XDsF7
d7WUnnye6hynzM8dvIss6k/2aBStqrOQt/iHi8b1hl8ypyuBVw0u0rL9cmfLwUvw
02sVQtjqAeX9qoZY7Cwn76VObSj2lm6Ho2Ux1yl8f5uNnbhCrlRlZCSNxgoBJNwl
mEvhtVce0F4n8Jj5t2nxysKCPw05TVbr3+2s+F7h8GIUoqvJvfzoY9k3wHBVRa3b
gQjaKudgriP0WcPQNwSojr9jqv9wv9itr/DcN/xxloVYDDfVwozd4BNggvoDL5+c
SQIDAQAB
-----END PUBLIC KEY-----`;

export const qrSecurity = {
    /**
     * Verify a signed QR code token
     * @param {string} token - The JWT string from the QR code
     * @returns {Promise<Object>} - The decoded payload if valid
     * @throws {Error} - If signature is invalid or token is malformed
     */
    async verifyQrPayload(token) {
        try {
            // Import the public key
            const publicKey = await jose.importSPKI(PUBLIC_KEY_PEM, "RS256");

            // Verify the signature
            const { payload } = await jose.jwtVerify(token, publicKey, {
                algorithms: ["RS256"],
            });

            console.log("[DEBUG] QR Signature Verified:", payload);
            return payload;
        } catch (err) {
            console.error("[DEBUG] QR Verification Failed:", err.message);
            throw new Error("Invalid or tampered QR code.");
        }
    },

    /**
     * Decode a JWT without verifying signature
     * Useful for checking payload structure before sending to backend
     * especially if algorithm is HS256 (which we can't verify on client)
     */
    decode(token) {
        try {
            return jose.decodeJwt(token);
        } catch (err) {
            return null; // Not a valid JWT
        }
    }
};
