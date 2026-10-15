
exports.handler = async (event) => {
  const headers = {
    "Content-Type": "application/json"
  };

  const reply = (statusCode, data) => ({
    statusCode,
    headers,
    body: JSON.stringify(data)
  });

  if (event.httpMethod !== "POST") {
    return reply(405, { ok: false, error: "POST only" });
  }

  try {
    const { bin } = JSON.parse(event.body || "{}");

    if (!/^\d{6,8}$/.test(String(bin || ""))) {
      return reply(400, {
        ok: false,
        error: "Enter a 6–8 digit BIN/IIN prefix only"
      });
    }

    const response = await fetch(
      "https://lookup.binlist.net/" + bin,
      {
        headers: {
          "Accept-Version": "3"
        }
      }
    );

    if (!response.ok) {
      return reply(200, {
        ok: true,
        country: "Unknown",
        bank: "Unknown",
        network: "Unknown",
        type: "Unknown",
        level: "Unknown"
      });
    }

    const data = await response.json();

    return reply(200, {
      ok: true,
      country: data.country?.name || "Unknown",
      bank: data.bank?.name || "Unknown",
      network: data.scheme || "Unknown",
      type: data.type || "Unknown",
      level: data.brand || "Unknown"
    });
  } catch {
    return reply(502, {
      ok: false,
      error: "Lookup service unavailable"
    });
  }
};
