/**
 * This file acts as a database for all known venues (scenes).
 * It organizes them in a hierarchy: Country -> City -> Scene.
 */

// --- DATA STRUCTURE DEFINITIONS ---

// A single venue/scene with its details.
export interface Scene {
  name: string; // The official, display name of the venue
  address: string;
  coords: [number, number]; // [longitude, latitude]
  aliases?: string[]; // Other names the venue might be called in scrapes
}

// A city containing a list of scenes.
export interface City {
  name: string;
  scenes: Scene[];
}

// A country containing a list of cities.
export interface Country {
  name: string;
  cities: City[];
}


// --- THE MASTER DATA SOURCE ---
// All data is now stored in this structured array.
const countries: Country[] = [
  {
    name: "Norway",
    cities: [
      {
        name: "Oslo",
        scenes: [
          {
            name: 'Rockefeller Music Hall',
            address: 'Torggata 16, 0181 Oslo',
            coords: [10.7516, 59.9158],
            aliases: ['Rockefeller', 'John Dee'],
          },
          {
            name: 'Sentrum Scene',
            address: 'Arbeidersamfunnets plass 1, 0181 Oslo',
            coords: [10.7537, 59.9163],
            aliases: [],
          },
          {
            name: 'SALT art & music',
            address: 'Langkaia 1, 0150 Oslo',
            coords: [10.7523, 59.9075],
            aliases: [],
          },
          {
            name: 'Parkteatret Scene',
            address: 'Olaf Ryes plass 11, 0552 Oslo',
            coords: [10.7590, 59.9230],
            aliases: ['Parkteatret'],
          },
          {
            name: 'Blå',
            address: 'Brenneriveien 9, 0182 Oslo',
            coords: [10.7505, 59.9200],
            aliases: [],
          },
          {
            name: 'Cosmopolite Scene',
            address: 'Vogts gate 64, 0477 Oslo',
            coords: [10.7700, 59.9298],
            aliases: ['Cosmopolite'],
          },
          {
            name: 'Kafé Hærverk',
            address: 'Hausmanns gate 34, 0182 Oslo',
            coords: [10.7554, 59.9142],
            aliases: [],
          },
          {
            name: 'Uhørt',
            address: 'Torggata 11, 0181 Oslo',
            coords: [10.7443, 59.9157],
            aliases: [],
          },
          {
            name: 'Kulturhuset',
            address: 'Youngs gate 6, 0181 Oslo',
            coords: [10.7495, 59.9144],
            aliases: [],
          },
          {
            name: 'Vulkan Arena',
            address: 'Vulkan 26, 0178 Oslo',
            coords: [10.7529, 59.9221],
            aliases: [],
          },
        ]
      },
      // You could easily add more cities here in the future
      // { name: "Bergen", scenes: [ ... ] }
    ]
  },
  // And even more countries
  // { name: "Sweden", cities: [ ... ] }
];


// --- INTERNAL LOOKUP SYSTEM (for performance) ---
// This creates a fast, case-insensitive lookup map from any alias or name
// to the canonical Scene object. This logic now reads from our new hierarchical structure.
const sceneLookup = new Map<string, Scene>();
countries.forEach(country => {
  country.cities.forEach(city => {
    city.scenes.forEach(scene => {
      sceneLookup.set(scene.name.toLowerCase(), scene);
      scene.aliases?.forEach(alias => {
        sceneLookup.set(alias.toLowerCase(), scene);
      });
    });
  });
});


// --- PUBLIC API FUNCTIONS ---

/**
 * Finds a canonical scene object by its name or alias.
 * This function's signature and behavior have not changed, so no
 * consuming components need to be updated.
 * @param name The venue name from the scraped event.
 * @returns A Scene object or null if not found.
 */
export function findSceneByName(name: string | null): Scene | null {
  if (!name) return null;
  return sceneLookup.get(name.toLowerCase()) || null;
}

/**
 * Gets the full list of all known countries.
 */
export function getAllCountries(): Country[] {
  return countries;
}

/**
 * Gets all scenes for a specific city.
 * @param cityName The name of the city to get scenes for.
 * @param countryName The name of the country (defaults to Norway).
 * @returns An array of Scene objects.
 */
export function getScenesByCity(cityName: string, countryName: string = "Norway"): Scene[] {
  const country = countries.find(c => c.name.toLowerCase() === countryName.toLowerCase());
  const city = country?.cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
  return city?.scenes || [];
}