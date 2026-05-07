// City + college coordinates for the coverage map.
// Colleges roll into their host city's coords so coverage aggregates by city.

const NY: Record<string, [number, number]> = {
  Buffalo: [42.8864, -78.8784],
  Rochester: [43.1566, -77.6088],
  Syracuse: [43.0481, -76.1474],
  Ithaca: [42.444, -76.5019],
  "Niagara Falls": [43.0962, -79.0377],
  Geneva: [42.8689, -76.9885],
  Canandaigua: [42.887, -77.2814],
  Auburn: [42.9317, -76.5661],
  Cortland: [42.6012, -76.1805],
  Elmira: [42.0898, -76.8077],
  Hornell: [42.3275, -77.6597],
  Olean: [42.0779, -78.4303],
  Jamestown: [42.097, -79.2353],
  Dunkirk: [42.4795, -79.3339],
  "East Aurora": [42.7681, -78.6133],
  Lockport: [43.1706, -78.6903],
  Batavia: [42.9981, -78.1875],
  Watertown: [43.9748, -75.9108],
  Albany: [42.6526, -73.7562],
  Schenectady: [42.8142, -73.9396],
  Troy: [42.7284, -73.6918],
  Binghamton: [42.0987, -75.918],
  Utica: [43.1009, -75.2327],
  "Saratoga Springs": [43.0831, -73.7846],
  Plattsburgh: [44.6995, -73.4529],
  Oneonta: [42.4528, -75.0638],
  // Smaller college towns (so college rollup hits real coords)
  Geneseo: [42.8006, -77.8167],
  Brockport: [43.2148, -77.9389],
  Fredonia: [42.4404, -79.3306],
  Houghton: [42.4234, -78.1573],
  Hamilton: [42.8245, -75.5436], // Hamilton NY (Colgate)
  Oswego: [43.4553, -76.5105],
  "St. Bonaventure": [42.0779, -78.4754],
};

const OH: Record<string, [number, number]> = {
  Cleveland: [41.4993, -81.6944],
  Akron: [41.0814, -81.519],
  Canton: [40.7989, -81.3784],
  Toledo: [41.6528, -83.5379],
  Youngstown: [41.0998, -80.6495],
  "Lima, OH": [40.7426, -84.1052],
  "Mansfield, OH": [40.7584, -82.5154],
  Sandusky: [41.4489, -82.708],
  Lorain: [41.4528, -82.1824],
  Findlay: [41.0442, -83.6499],
  "Warren, OH": [41.2376, -80.8184],
  Oberlin: [41.2939, -82.2174],
  Wooster: [40.8051, -81.9351],
  Berea: [41.3661, -81.8543], // Baldwin Wallace
  "Bowling Green": [41.3748, -83.6513],
  Kent: [41.1537, -81.3579],
  Ashland: [40.8689, -82.3179],
  Alliance: [40.9098, -81.106], // Mount Union
};

const PA: Record<string, [number, number]> = {
  Pittsburgh: [40.4406, -79.9959],
  "Erie, PA": [42.1292, -80.0851],
  "Altoona, PA": [40.5187, -78.3947],
  "Johnstown, PA": [40.3268, -78.922],
  "Meadville, PA": [41.6414, -80.1517],
  "Bradford, PA": [41.9595, -78.6442],
  "Warren, PA": [41.8439, -79.1453],
  "Beaver Falls, PA": [40.7515, -80.3198],
  "Butler, PA": [40.8617, -79.8953],
  "Sharon, PA": [41.2336, -80.4934],
  "New Castle, PA": [41.0036, -80.347],
  "Oil City, PA": [41.4334, -79.7065],
  "Indiana, PA": [40.6217, -79.1525],
  Edinboro: [41.8717, -80.1265],
  "Slippery Rock": [41.0631, -80.056],
  "Grove City": [41.158, -80.0884],
  Latrobe: [40.3201, -79.3795], // Saint Vincent
  "Washington, PA": [40.1734, -80.2462], // Washington & Jefferson
  "New Wilmington": [41.1217, -80.3315], // Westminster
};

const ON: Record<string, [number, number]> = {
  Toronto: [43.6532, -79.3832],
  "Hamilton, ON": [43.2557, -79.8711],
  Mississauga: [43.589, -79.6441],
  "Burlington, ON": [43.3255, -79.799],
  Oakville: [43.4675, -79.6877],
  "St. Catharines": [43.1594, -79.2469],
  "Niagara Falls, ON": [43.0896, -79.0849],
  Welland: [42.9923, -79.2483],
  "Fort Erie": [42.9072, -78.9099],
  Brantford: [43.1394, -80.2644],
  Kitchener: [43.4516, -80.4925],
  "Waterloo, ON": [43.4643, -80.5204],
  "Cambridge, ON": [43.3601, -80.3144],
  Guelph: [43.5448, -80.2482],
  "London, ON": [42.9849, -81.2453],
  Windsor: [42.3149, -83.0364],
  Kingston: [44.2312, -76.486],
  Oshawa: [43.8971, -78.8658],
  Barrie: [44.3894, -79.6903],
  Peterborough: [44.3091, -78.3197],
  Sarnia: [42.9994, -82.3089],
  Chatham: [42.4048, -82.191],
};

export const CITY_COORDS: Record<string, [number, number]> = {
  ...NY,
  ...OH,
  ...PA,
  ...ON,
};

// Maps every college in TARGET_CITY_GROUPS to its host city in CITY_COORDS
// (so a target_area of "University at Buffalo" counts toward Buffalo coverage)
export const COLLEGE_TO_CITY: Record<string, string> = {
  // NY
  "University at Buffalo": "Buffalo",
  "Buffalo State": "Buffalo",
  "Canisius University": "Buffalo",
  "University of Rochester": "Rochester",
  RIT: "Rochester",
  "Nazareth University": "Rochester",
  "Syracuse University": "Syracuse",
  "Cornell University": "Ithaca",
  "Ithaca College": "Ithaca",
  "SUNY Geneseo": "Geneseo",
  "SUNY Brockport": "Brockport",
  "SUNY Fredonia": "Fredonia",
  "St. Bonaventure": "St. Bonaventure",
  "Houghton University": "Houghton",
  "Hobart & William Smith": "Geneva",
  "Colgate University": "Hamilton",
  RPI: "Troy",
  "SUNY Binghamton": "Binghamton",
  "SUNY Albany": "Albany",
  "SUNY Oswego": "Oswego",
  "SUNY Cortland": "Cortland",
  "SUNY Oneonta": "Oneonta",
  "Skidmore College": "Saratoga Springs",
  // OH
  "Case Western Reserve": "Cleveland",
  "Cleveland State": "Cleveland",
  "John Carroll University": "Cleveland",
  "University of Akron": "Akron",
  "Kent State": "Kent",
  "Bowling Green State": "Bowling Green",
  "University of Toledo": "Toledo",
  "Youngstown State": "Youngstown",
  "Oberlin College": "Oberlin",
  "College of Wooster": "Wooster",
  "Baldwin Wallace": "Berea",
  "Ashland University": "Ashland",
  "University of Findlay": "Findlay",
  "Mount Union": "Alliance",
  // PA
  "University of Pittsburgh": "Pittsburgh",
  "Carnegie Mellon": "Pittsburgh",
  "Duquesne University": "Pittsburgh",
  "Robert Morris University": "Pittsburgh",
  "Penn State Behrend": "Erie, PA",
  "Mercyhurst University": "Erie, PA",
  "Gannon University": "Erie, PA",
  "Edinboro University": "Edinboro",
  "Allegheny College": "Meadville, PA",
  "Grove City College": "Grove City",
  "Slippery Rock": "Slippery Rock",
  "Westminster College": "New Wilmington",
  "Geneva College": "Beaver Falls, PA",
  "Saint Vincent College": "Latrobe",
  "Washington & Jefferson": "Washington, PA",
  IUP: "Indiana, PA",
  // ON
  "University of Toronto": "Toronto",
  "York University": "Toronto",
  "Toronto Metropolitan University": "Toronto",
  "OCAD University": "Toronto",
  "McMaster University": "Hamilton, ON",
  "University of Waterloo": "Waterloo, ON",
  "Wilfrid Laurier": "Waterloo, ON",
  "University of Guelph": "Guelph",
  "Western University": "London, ON",
  "Brock University": "St. Catharines",
  "Niagara College": "Welland",
  "Conestoga College": "Kitchener",
  "Sheridan College": "Oakville",
  "Humber College": "Toronto",
  "Mohawk College": "Hamilton, ON",
  "Queen's University": "Kingston",
  "Trent University": "Peterborough",
  "Georgian College": "Barrie",
  "Fanshawe College": "London, ON",
  "University of Windsor": "Windsor",
  "St. Clair College": "Windsor",
};

/**
 * Resolve a target_area string to coordinates.
 * Returns null for custom areas we don't have coords for.
 */
export function coordsFor(name: string): [number, number] | null {
  if (CITY_COORDS[name]) return CITY_COORDS[name];
  const city = COLLEGE_TO_CITY[name];
  if (city && CITY_COORDS[city]) return CITY_COORDS[city];
  return null;
}

/**
 * Roll a target_area name to its host city for coverage aggregation.
 * Returns the input if it's already a city or unknown.
 */
export function cityFor(name: string): string {
  return COLLEGE_TO_CITY[name] ?? name;
}

export type CoverageCell = {
  city: string;
  lat: number;
  lng: number;
  ambassadorCount: number;
  ambassadorNames: string[];
};

export function aggregateCoverage(
  ambassadors: Array<{
    id: string;
    full_name: string;
    target_areas: string[] | null;
  }>,
): CoverageCell[] {
  const byCity = new Map<
    string,
    { lat: number; lng: number; ids: Set<string>; names: Set<string> }
  >();

  for (const a of ambassadors) {
    for (const area of a.target_areas ?? []) {
      const coords = coordsFor(area);
      if (!coords) continue;
      const city = cityFor(area);
      const cell = byCity.get(city) ?? {
        lat: coords[0],
        lng: coords[1],
        ids: new Set<string>(),
        names: new Set<string>(),
      };
      cell.ids.add(a.id);
      cell.names.add(a.full_name);
      byCity.set(city, cell);
    }
  }

  return Array.from(byCity.entries()).map(([city, c]) => ({
    city,
    lat: c.lat,
    lng: c.lng,
    ambassadorCount: c.ids.size,
    ambassadorNames: Array.from(c.names),
  }));
}

export const ALL_CITIES = Object.entries(CITY_COORDS).map(
  ([city, [lat, lng]]) => ({ city, lat, lng }),
);
