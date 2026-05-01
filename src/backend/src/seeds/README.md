# Database Seeds - Data References

This directory contains seed files for populating the MataBayan database with data source references, threat/category guides, and code implementations.

## Structure

```
seeds/
├── weatherReferences.js      # DB-03: Weather Dashboard references
├── earthquakeReferences.js   # DB-04: Earthquake Dashboard references
├── typhoonReferences.js      # DB-05: Typhoon Dashboard references
├── seedRunner.js             # Main seed execution script
└── README.md                 # This file
```

## Commits

### DB-03: Weather Dashboard Data References
- **Primary Source**: Open-Meteo API
- **Fallback Source**: Open-Meteo Geocoding API
- **Guide Type**: Weather Code (0-83+)
- **Update Frequency**: On-demand
- **Standards**: WMO, ISO 19115

### DB-04: Earthquake Dashboard Data References
- **Primary Source**: PHIVOLCS (Philippine Institute of Volcanology and Seismology)
- **Fallback Source**: USGS Earthquake Hazards Program
- **Guide Type**: Threat Level (Minor to Critical)
- **Update Frequency**: Every 5 minutes
- **Standards**: Richter Scale, PHIVOLCS Classification

### DB-05: Typhoon Dashboard Data References
- **Primary Source**: PAGASA (Philippine Atmospheric, Geophysical and Astronomical Services Administration)
- **Fallback Source**: JTWC (Joint Typhoon Warning Center)
- **Guide Types**: 
  - Category (Super Typhoon to Low Pressure Area)
  - Signal Number (Signal No. 1-4)
- **Update Frequency**: Every 30 minutes
- **Standards**: Saffir-Simpson Scale (adapted), PAGASA Classification

## Running the Seeds

### Prerequisites
- Node.js installed
- MongoDB running
- Environment variables configured (.env file)

### Execute Seeds

```bash
# From project root
node src/backend/src/seeds/seedRunner.js
```

### Expected Output

```
✓ Connected to MongoDB
✓ Cleared existing data references

📊 Seeding Weather Dashboard References (DB-03)...
✓ Inserted 1 weather reference(s)

📊 Seeding Earthquake Dashboard References (DB-04)...
✓ Inserted 1 earthquake reference(s)

📊 Seeding Typhoon Dashboard References (DB-05)...
✓ Inserted 2 typhoon reference(s)

==================================================
✓ Database seeding completed successfully!
==================================================
Total references inserted: 4

Commits:
  • DB-03: Weather Dashboard Data References
  • DB-04: Earthquake Dashboard Data References
  • DB-05: Typhoon Dashboard Data References
```

## DataReference Schema

Each reference document contains:

```javascript
{
  dashboardType: String,           // 'Weather', 'Earthquake', or 'Typhoon'
  primarySource: {
    name: String,
    url: String,
    description: String,
    organization: String
  },
  fallbackSource: {
    name: String,
    url: String,
    description: String,
    organization: String
  },
  guideType: String,               // 'Threat Level', 'Category', 'Weather Code', 'Signal Number'
  guideItems: [{
    label: String,
    range: String,
    color: String,
    description: String
  }],
  codeImplementation: {
    language: String,              // 'JavaScript'
    fileName: String,
    filePath: String,
    code: String,                  // Full code snippet
    description: String
  },
  updateFrequency: {
    interval: Number,
    unit: String                   // 'minutes', 'hours', 'days'
  },
  standards: [String],             // e.g., ['Richter Scale', 'WMO Standards']
  createdAt: Date,
  updatedAt: Date,
  createdBy: String,
  notes: String
}
```

## Querying Data References

### Get all Weather Dashboard references
```javascript
const refs = await DataReference.find({ dashboardType: 'Weather' });
```

### Get Threat Level guide for Earthquakes
```javascript
const threatGuide = await DataReference.findOne({
  dashboardType: 'Earthquake',
  guideType: 'Threat Level'
});
```

### Get Category guide for Typhoons
```javascript
const categoryGuide = await DataReference.findOne({
  dashboardType: 'Typhoon',
  guideType: 'Category'
});
```

## Notes

- Each seed file is independent and can be modified separately
- Code implementations are stored as strings for documentation purposes
- All references include standards and best practices used
- Update frequencies indicate how often data is refreshed from sources
- Fallback sources ensure service continuity if primary sources are unavailable

## Related Files

- Model: `src/backend/src/models/DataReference.js`
- Controllers: `src/backend/src/controllers/` (can be extended to expose references via API)
- Frontend: `src/frontend/src/pages/` (Weather, Earthquake, Typhoon Dashboards)
