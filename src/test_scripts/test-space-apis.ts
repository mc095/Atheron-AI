/**
 * Space APIs Test Script
 * Run with: npx tsx src/test-space-apis.ts
 * 
 * Make sure to set N2YO_API_KEY in your .env file
 */

import * as dotenv from 'dotenv';
dotenv.config();

import {
    getISSPosition,
    getSatellitePosition,
    getSatellitesAbove,
    getLatestSpaceXLaunch,
    getUpcomingSpaceXLaunches,
    getPastSpaceXLaunches,
    getSpaceXRockets,
    getISROSpacecrafts,
    getISROLaunchVehicles,
    getISROCentres,
    getNasaAPOD,
    getSpaceDataSummary,
} from './lib/space-apis';

const divider = () => console.log('\n' + '='.repeat(60) + '\n');

async function testN2YOAPI() {
    console.log('🛰️  Testing N2YO Satellite API...\n');

    // Test ISS Position
    console.log('📍 ISS Current Position:');
    const iss = await getISSPosition();
    if (iss) {
        console.log(`   Latitude: ${iss.satlatitude.toFixed(4)}°`);
        console.log(`   Longitude: ${iss.satlongitude.toFixed(4)}°`);
        console.log(`   Altitude: ${iss.sataltitude.toFixed(2)} km`);
        console.log(`   Timestamp: ${new Date(iss.timestamp * 1000).toISOString()}`);
    } else {
        console.log('   ❌ Failed to fetch ISS position (check N2YO_API_KEY)');
    }

    // Test Satellites Above
    console.log('\n🌍 Satellites Above Delhi, India (28.6°N, 77.2°E):');
    const above = await getSatellitesAbove(28.6139, 77.209, 70, 0);
    if (above) {
        console.log(`   Found ${above.info.satcount} satellites`);
        if (above.above.length > 0) {
            console.log('   Top 3:');
            above.above.slice(0, 3).forEach((sat, i) => {
                console.log(`   ${i + 1}. ${sat.satname} (NORAD: ${sat.satid})`);
            });
        }
    } else {
        console.log('   ❌ Failed to fetch satellites above location');
    }
}

async function testSpaceXAPI() {
    console.log('🚀 Testing SpaceX API...\n');

    // Latest Launch
    console.log('📅 Latest SpaceX Launch:');
    const latest = await getLatestSpaceXLaunch();
    if (latest) {
        console.log(`   Mission: ${latest.name}`);
        console.log(`   Flight #: ${latest.flight_number}`);
        console.log(`   Date: ${new Date(latest.date_utc).toLocaleDateString()}`);
        console.log(`   Success: ${latest.success === null ? 'Pending' : latest.success ? '✅' : '❌'}`);
    } else {
        console.log('   ❌ Failed to fetch latest launch');
    }

    // Upcoming Launches
    console.log('\n🗓️  Upcoming SpaceX Launches:');
    const upcoming = await getUpcomingSpaceXLaunches(3);
    if (upcoming.length > 0) {
        upcoming.forEach((launch, i) => {
            console.log(`   ${i + 1}. ${launch.name} - ${new Date(launch.date_utc).toLocaleDateString()}`);
        });
    } else {
        console.log('   No upcoming launches found');
    }

    // Rockets
    console.log('\n🔥 SpaceX Rockets:');
    const rockets = await getSpaceXRockets();
    rockets.forEach(rocket => {
        console.log(`   • ${rocket.name} - ${rocket.active ? 'Active' : 'Retired'} - Success: ${rocket.success_rate_pct}%`);
    });
}

async function testISROAPI() {
    console.log('🇮🇳 Testing ISRO API...\n');

    // Spacecrafts
    console.log('🛸 ISRO Spacecrafts (first 5):');
    const spacecrafts = await getISROSpacecrafts();
    spacecrafts.slice(0, 5).forEach((sc, i) => {
        console.log(`   ${i + 1}. ${sc.name}`);
    });
    console.log(`   ... and ${spacecrafts.length - 5} more`);

    // Launch Vehicles
    console.log('\n🚀 ISRO Launch Vehicles:');
    const vehicles = await getISROLaunchVehicles();
    vehicles.forEach(v => {
        console.log(`   • ${v.name}`);
    });

    // Centres
    console.log('\n🏛️  ISRO Centres (first 5):');
    const centres = await getISROCentres();
    centres.slice(0, 5).forEach((c, i) => {
        console.log(`   ${i + 1}. ${c.name}, ${c.Place}, ${c.State}`);
    });
}

async function testNASAAPI() {
    console.log('🌌 Testing NASA API...\n');

    console.log('📸 Astronomy Picture of the Day:');
    const apod = await getNasaAPOD();
    if (apod) {
        console.log(`   Title: ${apod.title}`);
        console.log(`   Date: ${apod.date}`);
        console.log(`   Type: ${apod.media_type}`);
        console.log(`   URL: ${apod.url}`);
        if (apod.copyright) {
            console.log(`   © ${apod.copyright}`);
        }
    } else {
        console.log('   ❌ Failed to fetch APOD');
    }
}

async function testAggregatedData() {
    console.log('📊 Testing Aggregated Space Data Summary...\n');

    const summary = await getSpaceDataSummary();

    console.log('Summary contains:');
    console.log(`   • ISS Position: ${summary.iss ? '✅' : '❌'}`);
    console.log(`   • Latest SpaceX Launch: ${summary.latestSpaceXLaunch ? '✅' : '❌'}`);
    console.log(`   • Upcoming SpaceX Launches: ${summary.upcomingSpaceXLaunches.length}`);
    console.log(`   • ISRO Spacecrafts: ${summary.isroSpacecrafts.length}`);
    console.log(`   • NASA APOD: ${summary.nasaAPOD ? '✅' : '❌'}`);
}

async function main() {
    console.log('\n🌟 ATHEY SPACE APIs TEST SUITE 🌟');
    console.log('================================\n');

    // Check for API key
    if (!process.env.N2YO_API_KEY) {
        console.log('⚠️  Warning: N2YO_API_KEY not found in environment');
        console.log('   Satellite tracking tests may fail.\n');
    }

    try {
        await testN2YOAPI();
        divider();

        await testSpaceXAPI();
        divider();

        await testISROAPI();
        divider();

        await testNASAAPI();
        divider();

        await testAggregatedData();

        console.log('\n✅ All tests completed!\n');
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

main();
