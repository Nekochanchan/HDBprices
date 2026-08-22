let cache: { key: string; body: any; at: number } | null = null;

export default async function handler(req: any, res: any) {
  try {
    const qs = new URLSearchParams(req.query as any).toString();
    if (cache && cache.key === qs && Date.now() - cache.at < 5 * 60 * 1000) {
      return res.status(200).json(cache.body); // five-minute cache
    }
    const r = await fetch("https://data.gov.sg/api/action/datastore_search?" + qs, {
      headers: {
        'Accept': 'application/json',
      },
    });
    const body = await r.json();
    if (r.ok) cache = { key: qs, body, at: Date.now() };
    res.status(r.status).json(body);
  } catch (err: any) {
    console.error("API proxy fetch error:", err);
    res.status(500).json({ success: false, error: err?.message || 'Error fetching data from data.gov.sg' });
  }
}

