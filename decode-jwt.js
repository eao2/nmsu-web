import { jwtDecrypt } from 'jose';
import base64url from 'base64url';

const sessionToken = "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..1s1tKCdWek723Jvv.c3Rw9G8WhbEXKhV_uBz0bDzm3xgYFGEw5GHMnQD4AKB8ZIceXhB-36_aBa3rekCf5u0LE5D_Q3irrguGo_2bprS1n9ogTRj3_HVXnUjdyIlyCulu5itNqDrA4nf2GWcJMkgBh367ADoH4_4UUNNhNfYMoZ4dMRu7rRTc1TJfnYtvWyDU0ONC_EqypPURSgyawebAF3IcxxWnSHqjaEWQZaLT0hScBoeItrvTVSDXHV_UTsdRycHkKM5juMqkPfj54eKdKPHSH0aRtlvuReofY0nwMUqpk1x-9npA14e9YkNJf99UcDn0U3_No-31xckW0GzPWt9oPJHHTHBAatW3hHny4-tVfhllkAXHCluTmlvVDAsA2SIaB9PbGIT0-PI3RawVfjjP5_ieAVHB532aEJrW9SZ1g56qdg8kzjJ4pL3e4dEnx5RS0qgoHMLb-vkzrc1ysHuNeUIXaoXtkDevNP8H2zznIo9qD16Y.ywHoG4VWB0W9Gk3atNjsvw";

const secret = "93c3c5272bef6cd715ac077223c853c6"; // from .env

async function decodeToken() {
  try {
    // Try both plain and base64-decoded versions
    let secretKey;
    try {
      secretKey = base64url.toBuffer(secret);
    } catch {
      secretKey = new TextEncoder().encode(secret);
    }

    const { payload } = await jwtDecrypt(sessionToken, secretKey);
    console.log("Decoded JWT payload:", JSON.stringify(payload, null, 2));
  } catch (error) {
    console.error("Failed to decrypt:", error.message);
  }
}

decodeToken();
