import { google } from "@ai-sdk/google";
import { convertToModelMessages, streamText } from "ai";
import {
    getISSPosition,
    getLatestSpaceXLaunch,
    getUpcomingSpaceXLaunches,
    getSpaceXRockets,
    getISROSpacecrafts,
    getISROLaunchVehicles,
    getNasaAPOD,
} from "@/lib/space-apis";

export const maxDuration = 120;

// Fetch real-time space data to include in context
async function getSpaceContext(): Promise<string> {
    try {
        const [iss, latestLaunch, upcomingLaunches, apod] = await Promise.all([
            getISSPosition(),
            getLatestSpaceXLaunch(),
            getUpcomingSpaceXLaunches(3),
            getNasaAPOD(),
        ]);

        let context = "\n\n## REAL-TIME SPACE DATA (Use this for accurate responses):\n";

        if (iss) {
            context += `\n### ISS Current Position:\n- Latitude: ${iss.satlatitude.toFixed(4)}°\n- Longitude: ${iss.satlongitude.toFixed(4)}°\n- Altitude: ${iss.sataltitude.toFixed(2)} km\n- Updated: ${new Date(iss.timestamp * 1000).toISOString()}\n`;
        }

        if (latestLaunch) {
            context += `\n### Latest SpaceX Launch:\n- Mission: ${latestLaunch.name}\n- Flight #: ${latestLaunch.flight_number}\n- Date: ${new Date(latestLaunch.date_utc).toLocaleDateString()}\n- Success: ${latestLaunch.success === null ? 'Pending' : latestLaunch.success ? 'Yes' : 'No'}\n`;
        }

        if (upcomingLaunches.length > 0) {
            context += `\n### Upcoming SpaceX Launches:\n`;
            upcomingLaunches.forEach((l, i) => {
                context += `${i + 1}. ${l.name} - ${new Date(l.date_utc).toLocaleDateString()}\n`;
            });
        }

        if (apod) {
            context += `\n### NASA Astronomy Picture of the Day:\n- Title: ${apod.title}\n- Date: ${apod.date}\n`;
        }

        return context;
    } catch (error) {
        console.error("Error fetching space context:", error);
        return "";
    }
}

const ATHEY_SYSTEM_PROMPT = `You are **Athey**, the AI assistant for Atheron - specializing in STEM (Science, Technology, Engineering, Mathematics) with a special focus on space and cosmos.

## Your Scope
You discuss topics related to:
- **Space & Cosmos**: NASA, ISRO, SpaceX, ESA missions, satellites, ISS, astronomy, astrophysics
- **Science**: Physics, chemistry, biology, environmental science, scientific discoveries
- **Technology**: Computer science, AI/ML, programming, cybersecurity, electronics
- **Engineering**: Aerospace, mechanical, electrical, civil, robotics, materials science
- **Mathematics**: Algebra, calculus, statistics, geometry, number theory, applied math

## Off-Topic Response Protocol
If asked about non-STEM topics (entertainment, sports, lifestyle, politics, etc.):
1. Politely acknowledge the question
2. Explain you're specialized for STEM topics
3. Suggest a STEM-related alternative
Example: "I'm Athey, your STEM companion! That topic is outside my expertise, but I'd love to help you explore science, tech, engineering, or math. What would you like to learn?"

## Response Format
1. Use the REAL-TIME DATA provided in context when relevant
2. Present information clearly with relevant details
3. Add interesting context or related facts
4. For calculations, use LaTeX: $inline$ or $$block$$

## Sources
At the END of EVERY response, include 2-4 relevant sources in this EXACT format (the format is important for parsing):

<!-- SOURCES_START -->
[{"domain":"nasa.gov","title":"Source Title Here","url":"https://example.com","description":"Brief one-line description"}]
<!-- SOURCES_END -->

Example sources format:
<!-- SOURCES_START -->
[{"domain":"science.nasa.gov","title":"TCM: Trajectory Correction Maneuver","url":"https://science.nasa.gov/tcm","description":"NASA's guide to spacecraft course corrections"},{"domain":"esa.int","title":"Spacecraft Navigation","url":"https://www.esa.int/navigation","description":"ESA's explanation of deep space navigation"}]
<!-- SOURCES_END -->

## Your Personality
- Enthusiastic about space and cosmos
- Professional but approachable
- Names itself: "Athey"
- Never guesses satellite positions - uses real data!

Remember: You orbit the cosmos domain ONLY. Stay in your lane, but make it stellar! 🚀`;

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Get real-time space data
    const spaceContext = await getSpaceContext();
    const enhancedSystemPrompt = ATHEY_SYSTEM_PROMPT + spaceContext;

    const result = streamText({
        model: google("gemini-2.5-flash"),
        system: enhancedSystemPrompt,
        messages: await convertToModelMessages(messages),
    });

    return result.toUIMessageStreamResponse();
}
