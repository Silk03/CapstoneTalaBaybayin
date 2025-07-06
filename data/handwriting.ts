import { HandwritingCharacter } from '../types/handwriting';

//Import images statically (comment out if images don't exist yet)
 const images = {
   a: require('../assets/baybayin-guides/a.png'),
//   i: require('../assets/baybayin-guides/i.png'),
//   u: require('../assets/baybayin-guides/u.png'),
//   ka: require('../assets/baybayin-guides/ka.png'),
//   ga: require('../assets/baybayin-guides/ga.png'),
//   nga: require('../assets/baybayin-guides/nga.png'),
//   ta: require('../assets/baybayin-guides/ta.png'),
//   da: require('../assets/baybayin-guides/da.png'),
//   na: require('../assets/baybayin-guides/na.png'),
//   pa: require('../assets/baybayin-guides/pa.png'),
//   ba: require('../assets/baybayin-guides/ba.png'),
//   ma: require('../assets/baybayin-guides/ma.png'),
 };

export const handwritingCharacters: HandwritingCharacter[] = [
  {
    id: 'a',
    character: 'ᜀ',
    romanized: 'a',
    imageUri: images?.a || null,
    strokes: [],
    guideStrokes: [
      // Single curved stroke for 'a'
      [
        { x: 30, y: 20 },
        { x: 70, y: 20 },
        { x: 70, y: 80 },
        { x: 30, y: 80 },
        { x: 30, y: 50 }
      ]
    ]
  },
  {
    id: 'i',
    character: 'ᜁ',
    romanized: 'i',
    imageUri: null, // images?.i || null,
    strokes: [],
    guideStrokes: [
      // First stroke - main curve
      [
        { x: 30, y: 20 },
        { x: 70, y: 20 },
        { x: 70, y: 80 },
        { x: 30, y: 80 }
      ],
      // Second stroke - inner dot/mark
      [
        { x: 50, y: 50 },
        { x: 50, y: 50 }
      ]
    ]
  },
  {
    id: 'u',
    character: 'ᜂ',
    romanized: 'u',
    imageUri: null, // images?.u || null,
    strokes: [],
    guideStrokes: [
      // Main curved stroke
      [
        { x: 20, y: 30 },
        { x: 50, y: 20 },
        { x: 80, y: 30 },
        { x: 80, y: 70 },
        { x: 20, y: 70 }
      ]
    ]
  },
  {
    id: 'ka',
    character: 'ᜃ',
    romanized: 'ka',
    imageUri: null, // images?.ka || null,
    strokes: [],
    guideStrokes: [
      // First stroke - left vertical
      [
        { x: 30, y: 20 },
        { x: 30, y: 80 }
      ],
      // Second stroke - top curve
      [
        { x: 30, y: 20 },
        { x: 50, y: 10 },
        { x: 70, y: 20 },
        { x: 70, y: 40 }
      ],
      // Third stroke - bottom curve
      [
        { x: 30, y: 60 },
        { x: 50, y: 50 },
        { x: 70, y: 60 },
        { x: 70, y: 80 }
      ]
    ]
  },
  {
    id: 'ga',
    character: 'ᜄ',
    romanized: 'ga',
    imageUri: null, // images?.ga || null,
    strokes: [],
    guideStrokes: [
      // First stroke - top horizontal
      [
        { x: 20, y: 30 },
        { x: 80, y: 30 }
      ],
      // Second stroke - left vertical
      [
        { x: 20, y: 30 },
        { x: 20, y: 70 }
      ],
      // Third stroke - right vertical
      [
        { x: 80, y: 30 },
        { x: 80, y: 70 }
      ],
      // Fourth stroke - bottom horizontal
      [
        { x: 20, y: 70 },
        { x: 80, y: 70 }
      ]
    ]
  },
  {
    id: 'nga',
    character: 'ᜅ',
    romanized: 'nga',
    imageUri: null, // images?.nga || null,
    strokes: [],
    guideStrokes: [
      // First stroke - outer curve
      [
        { x: 20, y: 30 },
        { x: 50, y: 20 },
        { x: 80, y: 30 },
        { x: 80, y: 70 },
        { x: 50, y: 80 },
        { x: 20, y: 70 },
        { x: 20, y: 30 }
      ],
      // Second stroke - inner horizontal
      [
        { x: 30, y: 50 },
        { x: 70, y: 50 }
      ]
    ]
  },
  {
    id: 'ta',
    character: 'ᜆ',
    romanized: 'ta',
    imageUri: null, // images?.ta || null,
    strokes: [],
    guideStrokes: [
      // First stroke - top horizontal
      [
        { x: 20, y: 20 },
        { x: 80, y: 20 }
      ],
      // Second stroke - vertical line
      [
        { x: 50, y: 20 },
        { x: 50, y: 80 }
      ],
      // Third stroke - bottom curve
      [
        { x: 30, y: 80 },
        { x: 50, y: 90 },
        { x: 70, y: 80 }
      ]
    ]
  },
  {
    id: 'da',
    character: 'ᜇ',
    romanized: 'da',
    imageUri: null, // images?.da || null,
    strokes: [],
    guideStrokes: [
      // First stroke - left curve
      [
        { x: 20, y: 20 },
        { x: 20, y: 80 },
        { x: 40, y: 90 },
        { x: 60, y: 80 }
      ],
      // Second stroke - right line
      [
        { x: 70, y: 20 },
        { x: 70, y: 80 }
      ],
      // Third stroke - connecting curve
      [
        { x: 20, y: 50 },
        { x: 70, y: 50 }
      ]
    ]
  },
  {
    id: 'na',
    character: 'ᜈ',
    romanized: 'na',
    imageUri: null, // images?.na || null,
    strokes: [],
    guideStrokes: [
      // First stroke - left vertical
      [
        { x: 30, y: 20 },
        { x: 30, y: 80 }
      ],
      // Second stroke - top curve
      [
        { x: 30, y: 20 },
        { x: 50, y: 10 },
        { x: 70, y: 20 }
      ],
      // Third stroke - middle horizontal
      [
        { x: 30, y: 50 },
        { x: 70, y: 50 }
      ],
      // Fourth stroke - bottom curve
      [
        { x: 30, y: 80 },
        { x: 50, y: 90 },
        { x: 70, y: 80 }
      ]
    ]
  },
  {
    id: 'pa',
    character: 'ᜉ',
    romanized: 'pa',
    imageUri: null, // images?.pa || null,
    strokes: [],
    guideStrokes: [
      // First stroke - left vertical
      [
        { x: 20, y: 20 },
        { x: 20, y: 80 }
      ],
      // Second stroke - top horizontal
      [
        { x: 20, y: 20 },
        { x: 80, y: 20 }
      ],
      // Third stroke - middle horizontal
      [
        { x: 20, y: 50 },
        { x: 60, y: 50 }
      ]
    ]
  },
  {
    id: 'ba',
    character: 'ᜊ',
    romanized: 'ba',
    imageUri: null, // images?.ba || null,
    strokes: [],
    guideStrokes: [
      // First stroke - vertical line
      [
        { x: 50, y: 20 },
        { x: 50, y: 80 }
      ],
      // Second stroke - horizontal line
      [
        { x: 30, y: 50 },
        { x: 70, y: 50 }
      ],
      // Third stroke - bottom curve
      [
        { x: 50, y: 80 },
        { x: 60, y: 90 },
        { x: 70, y: 80 }
      ]
    ]
  },
  {
    id: 'ma',
    character: 'ᜋ',
    romanized: 'ma',
    imageUri: null, // images?.ma || null,
    strokes: [],
    guideStrokes: [
      // First stroke - outer square
      [
        { x: 20, y: 20 },
        { x: 80, y: 20 },
        { x: 80, y: 80 },
        { x: 20, y: 80 },
        { x: 20, y: 20 }
      ],
      // Second stroke - inner cross horizontal
      [
        { x: 30, y: 50 },
        { x: 70, y: 50 }
      ],
      // Third stroke - inner cross vertical
      [
        { x: 50, y: 30 },
        { x: 50, y: 70 }
      ]
    ]
  }
];
