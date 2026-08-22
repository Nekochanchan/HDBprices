export default async function handler(req: any, res: any) {
  try {
    const queryParams = new URLSearchParams(req.query || {});
    const qs = queryParams.toString();

    const onemapUrl = `https://www.onemap.gov.sg/api/common/elastic/search?${qs}`;

    const token = process.env.ONEMAP_TOKEN || process.env.ONEMAP_API_KEY;
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'HDBPrices-App/1.0',
    };

    if (token) {
      headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }

    const response = await fetch(onemapUrl, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: `OneMap API responded with status ${response.status}`,
        details: errorText,
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error('Error in /api/onemap/search:', error);
    return res.status(500).json({
      error: 'Internal Server Error forwarding OneMap search',
      message: error?.message || String(error),
    });
  }
}
