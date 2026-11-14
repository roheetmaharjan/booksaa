export async function GET(request) {
  const query = new URL(request.url).searchParams.get("q")?.trim();

  if (!query || query.length < 3 || query.length > 200) {
    return Response.json({ error: "Search query must be between 3 and 200 characters." }, { status: 400 });
  }

  try {
    const searchUrl = new URL("https://photon.komoot.io/api/");
    searchUrl.searchParams.set("limit", "5");
    searchUrl.searchParams.set("q", query);

    const response = await fetch(searchUrl, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Booksaa location search",
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      console.error("Location search provider error:", response.status, response.statusText);
      return Response.json({ error: "Address search is temporarily unavailable." }, { status: 502 });
    }

    const data = await response.json();
    return Response.json({
      results: (data.features || []).flatMap((feature) => {
        const [longitude, latitude] = feature.geometry?.coordinates || [];
        const properties = feature.properties || {};
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];

        const label = [...new Set([
          properties.name,
          properties.street,
          properties.housenumber,
          properties.postcode,
          properties.city || properties.locality || properties.district,
          properties.state,
          properties.country,
        ].filter(Boolean))].join(", ");

        return [{
          label,
          y: latitude,
          x: longitude,
          raw: {
            address: {
              city: properties.city || properties.locality,
              town: properties.town,
              village: properties.village,
              postcode: properties.postcode,
              country: properties.country,
              state: properties.state,
            },
          },
        }];
      }),
    });
  } catch (error) {
    console.error("Location search request failed:", error);
    return Response.json({ error: "Address search is temporarily unavailable." }, { status: 502 });
  }
}
