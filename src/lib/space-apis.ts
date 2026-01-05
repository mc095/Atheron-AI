/**
 * Space APIs Integration
 * Real-time data from N2YO, SpaceX, ISRO, and NASA
 */

// ============ Types ============

export interface SatellitePosition {
    satid: number;
    satname: string;
    satlatitude: number;
    satlongitude: number;
    sataltitude: number;
    azimuth: number;
    elevation: number;
    timestamp: number;
}

export interface SatelliteInfo {
    satid: number;
    satname: string;
    transactionscount: number;
}

export interface SatelliteAbove {
    satid: number;
    satname: string;
    intDesignator: string;
    launchDate: string;
    satlat: number;
    satlng: number;
    satalt: number;
}

export interface SpaceXLaunch {
    id: string;
    name: string;
    date_utc: string;
    date_local: string;
    success: boolean | null;
    upcoming: boolean;
    details: string | null;
    links: {
        patch: { small: string | null; large: string | null };
        webcast: string | null;
        wikipedia: string | null;
        article: string | null;
    };
    rocket: string;
    flight_number: number;
}

export interface SpaceXRocket {
    id: string;
    name: string;
    type: string;
    active: boolean;
    stages: number;
    boosters: number;
    cost_per_launch: number;
    success_rate_pct: number;
    first_flight: string;
    country: string;
    company: string;
    description: string;
    height: { meters: number; feet: number };
    diameter: { meters: number; feet: number };
    mass: { kg: number; lb: number };
}

export interface ISROSpacecraft {
    id: string;
    name: string;
}

export interface ISROLaunchVehicle {
    id: number;
    name: string;
}

export interface ISROCentre {
    id: number;
    name: string;
    Place: string;
    State: string;
}

export interface NasaAPOD {
    title: string;
    explanation: string;
    url: string;
    hdurl?: string;
    media_type: string;
    date: string;
    copyright?: string;
}

// ============ N2YO Satellite API ============

const N2YO_BASE_URL = "https://api.n2yo.com/rest/v1/satellite";

/**
 * Get real-time satellite position
 * @param noradId - NORAD catalog ID (e.g., 25544 for ISS)
 */
export async function getSatellitePosition(
    noradId: number,
    seconds: number = 1
): Promise<{ info: SatelliteInfo; positions: SatellitePosition[] } | null> {
    const apiKey = process.env.N2YO_API_KEY;
    if (!apiKey) {
        console.error("N2YO_API_KEY not set");
        return null;
    }

    try {
        // Default observer location (can be made dynamic)
        const lat = 0;
        const lng = 0;
        const alt = 0;

        const url = `${N2YO_BASE_URL}/positions/${noradId}/${lat}/${lng}/${alt}/${seconds}&apiKey=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`N2YO API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching satellite position:", error);
        return null;
    }
}

/**
 * Get satellites currently above a location
 * Categories: 0=All, 18=Amateur radio, 21=Cubesat, 52=Space stations
 */
export async function getSatellitesAbove(
    lat: number = 28.6139, // Default: India (Delhi)
    lng: number = 77.209,
    searchRadius: number = 70,
    categoryId: number = 0 // All categories
): Promise<{ info: { category: string; satcount: number }; above: SatelliteAbove[] } | null> {
    const apiKey = process.env.N2YO_API_KEY;
    if (!apiKey) {
        console.error("N2YO_API_KEY not set");
        return null;
    }

    try {
        const url = `${N2YO_BASE_URL}/above/${lat}/${lng}/0/${searchRadius}/${categoryId}&apiKey=${apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`N2YO API error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching satellites above:", error);
        return null;
    }
}

/**
 * Get ISS (International Space Station) position - convenience function
 */
export async function getISSPosition(): Promise<SatellitePosition | null> {
    const ISS_NORAD_ID = 25544;
    const result = await getSatellitePosition(ISS_NORAD_ID);
    return result?.positions?.[0] || null;
}

// ============ SpaceX API ============

const SPACEX_BASE_URL = "https://api.spacexdata.com/v4";

/**
 * Get the latest SpaceX launch
 */
export async function getLatestSpaceXLaunch(): Promise<SpaceXLaunch | null> {
    try {
        const response = await fetch(`${SPACEX_BASE_URL}/launches/latest`);
        if (!response.ok) {
            throw new Error(`SpaceX API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching SpaceX launch:", error);
        return null;
    }
}

/**
 * Get upcoming SpaceX launches
 */
export async function getUpcomingSpaceXLaunches(limit: number = 5): Promise<SpaceXLaunch[]> {
    try {
        const response = await fetch(`${SPACEX_BASE_URL}/launches/upcoming`);
        if (!response.ok) {
            throw new Error(`SpaceX API error: ${response.status}`);
        }
        const launches = await response.json();
        return launches.slice(0, limit);
    } catch (error) {
        console.error("Error fetching upcoming SpaceX launches:", error);
        return [];
    }
}

/**
 * Get all SpaceX rockets
 */
export async function getSpaceXRockets(): Promise<SpaceXRocket[]> {
    try {
        const response = await fetch(`${SPACEX_BASE_URL}/rockets`);
        if (!response.ok) {
            throw new Error(`SpaceX API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching SpaceX rockets:", error);
        return [];
    }
}

/**
 * Get past SpaceX launches
 */
export async function getPastSpaceXLaunches(limit: number = 10): Promise<SpaceXLaunch[]> {
    try {
        const response = await fetch(`${SPACEX_BASE_URL}/launches/past`);
        if (!response.ok) {
            throw new Error(`SpaceX API error: ${response.status}`);
        }
        const launches = await response.json();
        return launches.slice(-limit).reverse(); // Get most recent
    } catch (error) {
        console.error("Error fetching past SpaceX launches:", error);
        return [];
    }
}

// ============ ISRO API ============

const ISRO_BASE_URL = "https://isro.vercel.app/api";

/**
 * Get ISRO spacecrafts
 */
export async function getISROSpacecrafts(): Promise<ISROSpacecraft[]> {
    try {
        const response = await fetch(`${ISRO_BASE_URL}/spacecrafts`);
        if (!response.ok) {
            throw new Error(`ISRO API error: ${response.status}`);
        }
        const data = await response.json();
        return data.spacecrafts || [];
    } catch (error) {
        console.error("Error fetching ISRO spacecrafts:", error);
        return [];
    }
}

/**
 * Get ISRO launch vehicles
 */
export async function getISROLaunchVehicles(): Promise<ISROLaunchVehicle[]> {
    try {
        const response = await fetch(`${ISRO_BASE_URL}/launchers`);
        if (!response.ok) {
            throw new Error(`ISRO API error: ${response.status}`);
        }
        const data = await response.json();
        return data.launchers || [];
    } catch (error) {
        console.error("Error fetching ISRO launch vehicles:", error);
        return [];
    }
}

/**
 * Get ISRO centres
 */
export async function getISROCentres(): Promise<ISROCentre[]> {
    try {
        const response = await fetch(`${ISRO_BASE_URL}/centres`);
        if (!response.ok) {
            throw new Error(`ISRO API error: ${response.status}`);
        }
        const data = await response.json();
        return data.centres || [];
    } catch (error) {
        console.error("Error fetching ISRO centres:", error);
        return [];
    }
}

// ============ NASA API ============

const NASA_BASE_URL = "https://api.nasa.gov";

/**
 * Get NASA Astronomy Picture of the Day
 */
export async function getNasaAPOD(): Promise<NasaAPOD | null> {
    const apiKey = process.env.NASA_API_KEY || "DEMO_KEY";

    try {
        const response = await fetch(`${NASA_BASE_URL}/planetary/apod?api_key=${apiKey}`);
        if (!response.ok) {
            throw new Error(`NASA API error: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Error fetching NASA APOD:", error);
        return null;
    }
}

// ============ Aggregated Space Data ============

export interface SpaceDataSummary {
    iss: SatellitePosition | null;
    latestSpaceXLaunch: SpaceXLaunch | null;
    upcomingSpaceXLaunches: SpaceXLaunch[];
    isroSpacecrafts: ISROSpacecraft[];
    nasaAPOD: NasaAPOD | null;
}

/**
 * Get a summary of current space data
 */
export async function getSpaceDataSummary(): Promise<SpaceDataSummary> {
    const [iss, latestSpaceXLaunch, upcomingSpaceXLaunches, isroSpacecrafts, nasaAPOD] =
        await Promise.all([
            getISSPosition(),
            getLatestSpaceXLaunch(),
            getUpcomingSpaceXLaunches(3),
            getISROSpacecrafts(),
            getNasaAPOD(),
        ]);

    return {
        iss,
        latestSpaceXLaunch,
        upcomingSpaceXLaunches,
        isroSpacecrafts,
        nasaAPOD,
    };
}
