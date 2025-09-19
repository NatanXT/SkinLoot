package com.SkinLoot.SkinLoot.util;

import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters;
import org.bouncycastle.crypto.signers.Ed25519Signer;
import org.bouncycastle.util.encoders.Hex;

import java.nio.charset.StandardCharsets;

public class DMarketSignatureUtil {

    public static String buildSignature(String unsignedString, String secretKeyHex) {
        try {
            // Decode 64 bytes (128 hex chars)
            byte[] privateKeyBytes = Hex.decode(secretKeyHex);
            if (privateKeyBytes.length != 64) {
                throw new IllegalArgumentException("Secret key must be 64 bytes (128 hex characters)");
            }

            // Init signer
            Ed25519PrivateKeyParameters key = new Ed25519PrivateKeyParameters(privateKeyBytes, 0);
            Ed25519Signer signer = new Ed25519Signer();
            signer.init(true, key);

            byte[] message = unsignedString.getBytes(StandardCharsets.UTF_8);
            signer.update(message, 0, message.length);

            byte[] signature = signer.generateSignature();

            return "dmar ed25519 " + new String(Hex.encode(signature));
        } catch (Exception e) {
            throw new RuntimeException("Failed to build DMarket signature", e);
        }
    }
}
