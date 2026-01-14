# RF Scout

**Simplified RF Coordination for Touring Professionals**

RF Scout is a web application that helps audio engineers and production managers find safe frequencies for wireless microphones and in-ear monitors (IEMs) at any venue. No RF expertise required.

![RF Scout Interface](./docs/screenshot.png)

## Features

### Venue-Based Coordination
- **Pre-loaded venue database** with known RF profiles for major venues (Ryman, Red Rocks, MSG, etc.)
- **ZIP code lookup** for any US location
- **TV channel mapping** shows which frequencies are occupied by local broadcasters

### Smart Frequency Calculation
- **Automatic intermodulation (IM) avoidance** - calculates 3rd and 5th order IM products
- **Mic/IEM separation** - maintains 4+ MHz gap between mic and IEM groups
- **Safe spacing** - ensures proper frequency separation (250kHz for mics, 350kHz for IEMs)
- **TV channel exclusion** - automatically avoids frequencies used by local TV stations

### Visual Spectrum Display
- Real-time spectrum visualization showing:
  - TV channel occupancy (red blocks)
  - Your assigned frequencies (blue for mics, purple for IEMs)
  - Calculated intermodulation products (yellow lines)

### Export for Deployment
- **Wireless Workbench (WWB)** - Export frequency lists compatible with Shure WWB
- **Frequency List** - Simple text list for manual entry
- **Full Report** - CSV with all coordination details

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## How to Use

### 1. Select Your Venue
- Search for a known venue (Ryman, Red Rocks, etc.)
- Or enter a ZIP code for any US location

### 2. Review TV Channels
- The app shows default TV channels for your area
- Toggle channels on/off based on your local RF scan
- Blocked channels appear as red zones in the spectrum view

### 3. Set Your Channel Count
- Enter how many wireless mics you need
- Enter how many IEM packs you need

### 4. Calculate Frequencies
- Click "Calculate Safe Frequencies"
- The engine finds IM-free frequencies avoiding all TV channels
- Review the assignments and any warnings

### 5. Export for Deployment
- Choose WWB format for Shure Wireless Workbench
- Import directly into WWB for system configuration

## Understanding the Display

### Spectrum Visualization
```
|---[TV14]---|---[TV15]---|---CLEAR---|---[TV18]---|---CLEAR---|
    470          476          482          494          500
         ▲              ▲              ▲
         │              │              └─ Your IEM (purple)
         │              └─ IM Product (avoid)
         └─ Your Mic (blue)
```

### Color Coding
- **Red blocks** = Active TV channels (avoid)
- **Blue markers** = Wireless microphone frequencies
- **Purple markers** = IEM frequencies
- **Yellow lines** = Intermodulation products (calculated hazards)
- **Green status** = Safe, no conflicts
- **Yellow status** = Warning, review recommended
- **Red status** = Conflict, must resolve

## Export Formats

### Wireless Workbench (WWB)
```
// RF Scout Export for Wireless Workbench
// Venue: Ryman Auditorium
// Generated: 2024-01-15T10:30:00Z

482.125
484.375
486.625
488.875
566.250
568.500
570.750
573.000
```

Import in WWB via: **Coordination > Frequency List > Import**

### Frequency List
```
482.125 484.375 486.625 488.875 566.250 568.500 570.750 573.000
```

### Full Report (CSV)
```csv
Name,Type,Frequency (MHz),Status
"Mic 1",mic,482.125,calculated
"Mic 2",mic,484.375,calculated
"IEM 1",iem,566.250,calculated
"IEM 2",iem,568.500,calculated
```

## Technical Details

### Frequency Range
- **Primary UHF Band**: 470-608 MHz (TV Channels 14-36)
- This is the main spectrum available for wireless mics in the US post-2017 FCC auction

### Intermodulation Calculation
The app calculates:
- **3rd Order IM**: (2×F1 - F2) and (2×F2 - F1)
- **5th Order IM**: (3×F1 - 2×F2) and (3×F2 - 2×F1)

All assigned frequencies are verified to not land on any calculated IM products.

### Spacing Rules
- **Mic to Mic**: Minimum 250 kHz
- **IEM to IEM**: Minimum 350 kHz
- **Mic Group to IEM Group**: Minimum 4 MHz gap
- **From TV Channel Edge**: 500 kHz guard band

### Supported Manufacturer Bands
| Brand | Band | Range |
|-------|------|-------|
| Shure | G5 | 506-558 MHz |
| Shure | H5 | 562-614 MHz |
| Shure | J5 | 578-608 MHz |
| Sennheiser | A1 | 470-516 MHz |
| Sennheiser | A | 516-558 MHz |
| Sennheiser | G | 566-608 MHz |

## Venue Database

Pre-loaded venues with known RF characteristics:

| Venue | Location | Known Issues |
|-------|----------|--------------|
| Ryman Auditorium | Nashville, TN | Heavy TV Ch 28-32 |
| Red Rocks | Morrison, CO | Mountain multipath |
| Madison Square Garden | New York, NY | Extreme congestion |
| The Greek Theatre | Los Angeles, CA | LA market congested |
| ACL Live Moody Theater | Austin, TX | Generally clean |
| The Fillmore | San Francisco, CA | Bay Area congestion |
| The Gorge | George, WA | Very clean spectrum |

## Best Practices

### Before the Show
1. **Scan first** - Always do an RF scan at the venue
2. **Check local TV** - Verify which channels are actually active
3. **Have backups** - Calculate 2-3 extra frequencies per system
4. **Coordinate early** - Do RF coordination during advance, not load-in

### At the Venue
1. Import frequencies into WWB
2. Deploy to transmitters/receivers
3. Walk-test all systems
4. Monitor RF levels during soundcheck

### During the Show
- Watch for dropouts
- Have backup frequencies ready
- Keep transmitters at appropriate power levels

## Limitations

- TV channel data is based on FCC allocations and may vary locally
- Always verify with an actual RF scan at the venue
- Festival and multi-act scenarios require professional RF coordination
- This tool provides recommendations, not guarantees

## Development

### Tech Stack
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Lucide Icons

### Project Structure
```
rf-scout/
├── src/
│   ├── App.jsx          # Main application
│   ├── config.js        # Configuration & venue database
│   ├── api.js           # FCC API integration
│   ├── index.css        # Styles
│   └── main.jsx         # Entry point
├── public/
│   └── rf-icon.svg      # App icon
└── package.json
```

## Contributing

Built by touring professionals, for touring professionals.

Issues and PRs welcome at: [GitHub Repository]

## License

MIT License - Use freely for your tours.

---

*Always verify frequencies with an RF scan at the venue. This tool provides recommendations based on FCC data and intermodulation calculations, but local conditions may vary.*
