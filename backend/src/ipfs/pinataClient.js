import axios from "axios";
import FormData from "form-data";

const PINATA_BASE = "https://api.pinata.cloud/pinning";

const authHeaders = () => {
  if (process.env.PINATA_JWT) {
    return { Authorization: `Bearer ${process.env.PINATA_JWT}` };
  }
  return {
    pinata_api_key: process.env.PINATA_API_KEY,
    pinata_secret_api_key: process.env.PINATA_SECRET_KEY,
  };
};

export const uploadBuffer = async ({ buffer, filename, metadata = {} }) => {
  const data = new FormData();
  data.append("file", buffer, { filename });
  data.append("pinataMetadata", JSON.stringify({ name: filename, ...metadata }));

  const res = await axios.post(`${PINATA_BASE}/pinFileToIPFS`, data, {
    maxBodyLength: Infinity,
    headers: { ...authHeaders(), ...data.getHeaders() },
  });
  return res.data;
};

export const uploadJson = async (payload) => {
  const res = await axios.post(`${PINATA_BASE}/pinJSONToIPFS`, payload, {
    headers: authHeaders(),
  });
  return res.data;
};
