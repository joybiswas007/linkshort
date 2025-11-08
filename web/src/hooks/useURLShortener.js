import { useState } from "react";
import axios from "axios";

export function useURLShortener() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const shortenURL = async (payload) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await axios.post(
        "http://localhost:8000/api/v1/links",
        payload,
        { headers: { "Content-Type": "application/json" } },
      );

      setResult(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to shorten URL";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return { result, loading, error, shortenURL };
}
