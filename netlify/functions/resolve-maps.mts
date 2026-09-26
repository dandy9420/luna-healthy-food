export default async (req: Request) => {
  try {
    const body = await req.json();
    const input = String(body?.url || '').trim();
    if (!input) return new Response(JSON.stringify({error:"Missing URL"}), {status:400, headers:{"Content-Type":"application/json"}});

    const target = new URL(input);
    if (!/^https?:$/.test(target.protocol)) throw new Error("Invalid URL");

    const res = await fetch(target.toString(), {redirect:"follow", headers:{"User-Agent":"Mozilla/5.0"}});
    const finalUrl = res.url || target.toString();
    const text = await res.text();

    const candidates = [finalUrl, text];
    for (const value of candidates) {
      let m = value.match(/@(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
      if (m) return new Response(JSON.stringify({latitude:Number(m[1]),longitude:Number(m[2]),resolvedUrl:finalUrl}), {headers:{"Content-Type":"application/json"}});

      m = value.match(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/);
      if (m) return new Response(JSON.stringify({latitude:Number(m[1]),longitude:Number(m[2]),resolvedUrl:finalUrl}), {headers:{"Content-Type":"application/json"}});
    }

    return new Response(JSON.stringify({error:"Coordinates not found",resolvedUrl:finalUrl}), {status:422,headers:{"Content-Type":"application/json"}});
  } catch (e) {
    return new Response(JSON.stringify({error:"Could not resolve Google Maps link"}), {status:500,headers:{"Content-Type":"application/json"}});
  }
};
