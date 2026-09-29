const fs = require('fs');

const data = {
  // --- Lowercase Letters ---
  'a': [
      { type: 'move', p: {x: 250, y: 150} },
      { type: 'bezier', p0: {x: 250, y: 150}, p1: {x: 180, y: 120}, p2: {x: 120, y: 150}, p3: {x: 100, y: 220} },
      { type: 'bezier', p0: {x: 100, y: 220}, p1: {x: 90, y: 290}, p2: {x: 160, y: 310}, p3: {x: 220, y: 270} },
      { type: 'line', p0: {x: 220, y: 270}, p1: {x: 250, y: 150} },
      { type: 'move', p: {x: 250, y: 150} },
      { type: 'line', p0: {x: 250, y: 150}, p1: {x: 250, y: 290} },
      { type: 'bezier', p0: {x: 250, y: 290}, p1: {x: 250, y: 320}, p2: {x: 280, y: 320}, p3: {x: 310, y: 290} }
  ],
  'b': [
      { type: 'move', p: {x: 120, y: 80} },
      { type: 'line', p0: {x: 120, y: 80}, p1: {x: 120, y: 300} },
      { type: 'move', p: {x: 120, y: 180} },
      { type: 'bezier', p0: {x: 120, y: 180}, p1: {x: 200, y: 170}, p2: {x: 240, y: 210}, p3: {x: 240, y: 250} },
      { type: 'bezier', p0: {x: 240, y: 250}, p1: {x: 240, y: 290}, p2: {x: 190, y: 310}, p3: {x: 120, y: 300} }
  ],
  'c': [
      { type: 'move', p: {x: 260, y: 160} },
      { type: 'bezier', p0: {x: 260, y: 160}, p1: {x: 200, y: 120}, p2: {x: 120, y: 140}, p3: {x: 100, y: 220} },
      { type: 'bezier', p0: {x: 100, y: 220}, p1: {x: 90, y: 290}, p2: {x: 160, y: 320}, p3: {x: 260, y: 280} }
  ],
  'd': [
      { type: 'move', p: {x: 250, y: 150} },
      { type: 'bezier', p0: {x: 250, y: 150}, p1: {x: 180, y: 120}, p2: {x: 120, y: 150}, p3: {x: 100, y: 220} },
      { type: 'bezier', p0: {x: 100, y: 220}, p1: {x: 90, y: 290}, p2: {x: 160, y: 310}, p3: {x: 220, y: 270} },
      { type: 'line', p0: {x: 220, y: 270}, p1: {x: 250, y: 150} },
      { type: 'move', p: {x: 250, y: 80} },
      { type: 'line', p0: {x: 250, y: 80}, p1: {x: 250, y: 290} },
      { type: 'bezier', p0: {x: 250, y: 290}, p1: {x: 250, y: 320}, p2: {x: 280, y: 320}, p3: {x: 310, y: 290} }
  ],
  'e': [ {type:'move', p:{x:100,y:250}}, {type:'line', p0:{x:100,y:250}, p1:{x:260,y:250}}, {type:'bezier', p0:{x:260,y:250}, p1:{x:260,y:150}, p2:{x:100,y:150}, p3:{x:100,y:250}}, {type:'bezier', p0:{x:100,y:250}, p1:{x:100,y:350}, p2:{x:260,y:350}, p3:{x:260,y:300}} ],
  'f': [ {type:'move', p:{x:200,y:80}}, {type:'bezier', p0:{x:200,y:80}, p1:{x:150,y:80}, p2:{x:150,y:130}, p3:{x:150,y:180}}, {type:'line', p0:{x:150,y:180}, p1:{x:150,y:320}}, {type:'move', p:{x:100,y:180}}, {type:'line', p0:{x:100,y:180}, p1:{x:220,y:180}} ],
  'g': [ {type:'move', p:{x:250,y:180}}, {type:'bezier', p0:{x:250,y:180}, p1:{x:250,y:100}, p2:{x:100,y:100}, p3:{x:100,y:250}}, {type:'bezier', p0:{x:100,y:250}, p1:{x:100,y:300}, p2:{x:250,y:300}, p3:{x:250,y:250}}, {type:'line', p0:{x:250,y:250}, p1:{x:250,y:320}}, {type:'bezier', p0:{x:250,y:320}, p1:{x:250,y:400}, p2:{x:100,y:400}, p3:{x:100,y:360}} ],
  'h': [ {type:'move', p:{x:120,y:80}}, {type:'line', p0:{x:120,y:80}, p1:{x:120,y:320}}, {type:'move', p:{x:120,y:200}}, {type:'bezier', p0:{x:120,y:200}, p1:{x:120,y:150}, p2:{x:250,y:150}, p3:{x:250,y:220}}, {type:'line', p0:{x:250,y:220}, p1:{x:250,y:320}} ],
  'i': [ {type:'move', p:{x:190,y:180}}, {type:'line', p0:{x:190,y:180}, p1:{x:190,y:320}}, {type:'move', p:{x:190,y:120}}, {type:'line', p0:{x:190,y:120}, p1:{x:190,y:125}} ],
  'j': [ {type:'move', p:{x:190,y:180}}, {type:'line', p0:{x:190,y:180}, p1:{x:190,y:350}}, {type:'bezier', p0:{x:190,y:350}, p1:{x:190,y:400}, p2:{x:120,y:400}, p3:{x:120,y:360}}, {type:'move', p:{x:190,y:120}}, {type:'line', p0:{x:190,y:120}, p1:{x:190,y:125}} ],
  'k': [ {type:'move', p:{x:120,y:80}}, {type:'line', p0:{x:120,y:80}, p1:{x:120,y:320}}, {type:'move', p:{x:250,y:180}}, {type:'line', p0:{x:250,y:180}, p1:{x:120,y:250}}, {type:'move', p:{x:120,y:250}}, {type:'line', p0:{x:120,y:250}, p1:{x:250,y:320}} ],
  'l': [ {type:'move', p:{x:190,y:80}}, {type:'line', p0:{x:190,y:80}, p1:{x:190,y:320}} ],
  'm': [ {type:'move', p:{x:100,y:180}}, {type:'line', p0:{x:100,y:180}, p1:{x:100,y:320}}, {type:'move', p:{x:100,y:200}}, {type:'bezier', p0:{x:100,y:200}, p1:{x:100,y:150}, p2:{x:190,y:150}, p3:{x:190,y:200}}, {type:'line', p0:{x:190,y:200}, p1:{x:190,y:320}}, {type:'move', p:{x:190,y:200}}, {type:'bezier', p0:{x:190,y:200}, p1:{x:190,y:150}, p2:{x:280,y:150}, p3:{x:280,y:200}}, {type:'line', p0:{x:280,y:200}, p1:{x:280,y:320}} ],
  'n': [ {type:'move', p:{x:120,y:180}}, {type:'line', p0:{x:120,y:180}, p1:{x:120,y:320}}, {type:'move', p:{x:120,y:200}}, {type:'bezier', p0:{x:120,y:200}, p1:{x:120,y:150}, p2:{x:250,y:150}, p3:{x:250,y:220}}, {type:'line', p0:{x:250,y:220}, p1:{x:250,y:320}} ],
  'o': [ {type:'move', p:{x:190,y:180}}, {type:'bezier', p0:{x:190,y:180}, p1:{x:100,y:180}, p2:{x:100,y:320}, p3:{x:190,y:320}}, {type:'bezier', p0:{x:190,y:320}, p1:{x:280,y:320}, p2:{x:280,y:180}, p3:{x:190,y:180}} ],
  'p': [ {type:'move', p:{x:120,y:180}}, {type:'line', p0:{x:120,y:180}, p1:{x:120,y:400}}, {type:'move', p:{x:120,y:200}}, {type:'bezier', p0:{x:120,y:200}, p1:{x:120,y:150}, p2:{x:250,y:150}, p3:{x:250,y:250}}, {type:'bezier', p0:{x:250,y:250}, p1:{x:250,y:350}, p2:{x:120,y:350}, p3:{x:120,y:300}} ],
  'q': [ {type:'move', p:{x:250,y:180}}, {type:'bezier', p0:{x:250,y:180}, p1:{x:250,y:150}, p2:{x:120,y:150}, p3:{x:120,y:250}}, {type:'bezier', p0:{x:120,y:250}, p1:{x:120,y:350}, p2:{x:250,y:350}, p3:{x:250,y:300}}, {type:'line', p0:{x:250,y:300}, p1:{x:250,y:180}}, {type:'line', p0:{x:250,y:180}, p1:{x:250,y:400}} ],
  'r': [ {type:'move', p:{x:120,y:180}}, {type:'line', p0:{x:120,y:180}, p1:{x:120,y:320}}, {type:'move', p:{x:120,y:230}}, {type:'bezier', p0:{x:120,y:230}, p1:{x:120,y:180}, p2:{x:200,y:180}, p3:{x:240,y:190}} ],
  's': [ {type:'move', p:{x:250,y:200}}, {type:'bezier', p0:{x:250,y:200}, p1:{x:200,y:150}, p2:{x:120,y:180}, p3:{x:120,y:220}}, {type:'bezier', p0:{x:120,y:220}, p1:{x:120,y:260}, p2:{x:250,y:250}, p3:{x:250,y:280}}, {type:'bezier', p0:{x:250,y:280}, p1:{x:250,y:320}, p2:{x:120,y:340}, p3:{x:120,y:300}} ],
  't': [ {type:'move', p:{x:190,y:120}}, {type:'line', p0:{x:190,y:120}, p1:{x:190,y:300}}, {type:'bezier', p0:{x:190,y:300}, p1:{x:190,y:340}, p2:{x:240,y:340}, p3:{x:260,y:300}}, {type:'move', p:{x:140,y:180}}, {type:'line', p0:{x:140,y:180}, p1:{x:250,y:180}} ],
  'u': [ {type:'move', p:{x:120,y:180}}, {type:'line', p0:{x:120,y:180}, p1:{x:120,y:280}}, {type:'bezier', p0:{x:120,y:280}, p1:{x:120,y:340}, p2:{x:250,y:340}, p3:{x:250,y:280}}, {type:'line', p0:{x:250,y:280}, p1:{x:250,y:180}}, {type:'move', p:{x:250,y:180}}, {type:'line', p0:{x:250,y:180}, p1:{x:250,y:320}} ],
  'v': [ {type:'move', p:{x:120,y:180}}, {type:'line', p0:{x:120,y:180}, p1:{x:190,y:320}}, {type:'line', p0:{x:190,y:320}, p1:{x:260,y:180}} ],
  'w': [ {type:'move', p:{x:100,y:180}}, {type:'line', p0:{x:100,y:180}, p1:{x:140,y:320}}, {type:'line', p0:{x:140,y:320}, p1:{x:190,y:220}}, {type:'line', p0:{x:190,y:220}, p1:{x:240,y:320}}, {type:'line', p0:{x:240,y:320}, p1:{x:280,y:180}} ],
  'x': [ {type:'move', p:{x:120,y:180}}, {type:'line', p0:{x:120,y:180}, p1:{x:260,y:320}}, {type:'move', p:{x:260,y:180}}, {type:'line', p0:{x:260,y:180}, p1:{x:120,y:320}} ],
  'y': [ {type:'move', p:{x:120,y:180}}, {type:'line', p0:{x:120,y:180}, p1:{x:190,y:300}}, {type:'line', p0:{x:190,y:300}, p1:{x:260,y:180}}, {type:'move', p:{x:190,y:300}}, {type:'line', p0:{x:190,y:300}, p1:{x:190,y:350}}, {type:'bezier', p0:{x:190,y:350}, p1:{x:190,y:400}, p2:{x:120,y:400}, p3:{x:120,y:380}} ],
  'z': [ {type:'move', p:{x:120,y:180}}, {type:'line', p0:{x:120,y:180}, p1:{x:260,y:180}}, {type:'line', p0:{x:260,y:180}, p1:{x:120,y:320}}, {type:'line', p0:{x:120,y:320}, p1:{x:260,y:320}} ],

  // --- Uppercase Letters ---
  'A': [ {type:'move', p:{x:200,y:80}}, {type:'line', p0:{x:200,y:80}, p1:{x:100,y:320}}, {type:'move', p:{x:200,y:80}}, {type:'line', p0:{x:200,y:80}, p1:{x:300,y:320}}, {type:'move', p:{x:130,y:230}}, {type:'line', p0:{x:130,y:230}, p1:{x:270,y:230}} ],
  'B': [ {type:'move', p:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:100,y:320}}, {type:'move', p:{x:100,y:80}}, {type:'bezier', p0:{x:100,y:80}, p1:{x:250,y:80}, p2:{x:250,y:190}, p3:{x:100,y:200}}, {type:'move', p:{x:100,y:200}}, {type:'bezier', p0:{x:100,y:200}, p1:{x:280,y:200}, p2:{x:280,y:320}, p3:{x:100,y:320}} ],
  'C': [ {type:'move', p:{x:280,y:120}}, {type:'bezier', p0:{x:280,y:120}, p1:{x:200,y:40}, p2:{x:80,y:100}, p3:{x:100,y:200}}, {type:'bezier', p0:{x:100,y:200}, p1:{x:100,y:320}, p2:{x:200,y:360}, p3:{x:280,y:280}} ],
  'D': [ {type:'move', p:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:100,y:320}}, {type:'move', p:{x:100,y:80}}, {type:'bezier', p0:{x:100,y:80}, p1:{x:280,y:80}, p2:{x:280,y:320}, p3:{x:100,y:320}} ],
  'E': [ {type:'move', p:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:100,y:320}}, {type:'move', p:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:280,y:80}}, {type:'move', p:{x:100,y:200}}, {type:'line', p0:{x:100,y:200}, p1:{x:250,y:200}}, {type:'move', p:{x:100,y:320}}, {type:'line', p0:{x:100,y:320}, p1:{x:280,y:320}} ],
  'F': [ {type:'move', p:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:100,y:320}}, {type:'move', p:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:280,y:80}}, {type:'move', p:{x:100,y:200}}, {type:'line', p0:{x:100,y:200}, p1:{x:250,y:200}} ],
  'G': [ {type:'move', p:{x:280,y:120}}, {type:'bezier', p0:{x:280,y:120}, p1:{x:200,y:40}, p2:{x:80,y:100}, p3:{x:100,y:200}}, {type:'bezier', p0:{x:100,y:200}, p1:{x:100,y:320}, p2:{x:200,y:360}, p3:{x:280,y:280}}, {type:'line', p0:{x:280,y:280}, p1:{x:280,y:200}}, {type:'line', p0:{x:280,y:200}, p1:{x:200,y:200}} ],
  'H': [ {type:'move', p:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:100,y:320}}, {type:'move', p:{x:280,y:80}}, {type:'line', p0:{x:280,y:80}, p1:{x:280,y:320}}, {type:'move', p:{x:100,y:200}}, {type:'line', p0:{x:100,y:200}, p1:{x:280,y:200}} ],
  'I': [ {type:'move', p:{x:190,y:80}}, {type:'line', p0:{x:190,y:80}, p1:{x:190,y:320}}, {type:'move', p:{x:120,y:80}}, {type:'line', p0:{x:120,y:80}, p1:{x:260,y:80}}, {type:'move', p:{x:120,y:320}}, {type:'line', p0:{x:120,y:320}, p1:{x:260,y:320}} ],
  'J': [ {type:'move', p:{x:220,y:80}}, {type:'line', p0:{x:220,y:80}, p1:{x:220,y:250}}, {type:'bezier', p0:{x:220,y:250}, p1:{x:220,y:320}, p2:{x:100,y:320}, p3:{x:100,y:250}}, {type:'move', p:{x:150,y:80}}, {type:'line', p0:{x:150,y:80}, p1:{x:290,y:80}} ],
  'K': [ {type:'move', p:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:100,y:320}}, {type:'move', p:{x:280,y:80}}, {type:'line', p0:{x:280,y:80}, p1:{x:100,y:200}}, {type:'move', p:{x:100,y:200}}, {type:'line', p0:{x:100,y:200}, p1:{x:280,y:320}} ],
  'L': [ {type:'move', p:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:100,y:320}}, {type:'line', p0:{x:100,y:320}, p1:{x:280,y:320}} ],
  'M': [ {type:'move', p:{x:100,y:320}}, {type:'line', p0:{x:100,y:320}, p1:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:190,y:200}}, {type:'line', p0:{x:190,y:200}, p1:{x:280,y:80}}, {type:'line', p0:{x:280,y:80}, p1:{x:280,y:320}} ],
  'N': [ {type:'move', p:{x:100,y:320}}, {type:'line', p0:{x:100,y:320}, p1:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:280,y:320}}, {type:'line', p0:{x:280,y:320}, p1:{x:280,y:80}} ],
  'O': [ {type:'move', p:{x:190,y:80}}, {type:'bezier', p0:{x:190,y:80}, p1:{x:80,y:80}, p2:{x:80,y:320}, p3:{x:190,y:320}}, {type:'bezier', p0:{x:190,y:320}, p1:{x:300,y:320}, p2:{x:300,y:80}, p3:{x:190,y:80}} ],
  'P': [ {type:'move', p:{x:100,y:320}}, {type:'line', p0:{x:100,y:320}, p1:{x:100,y:80}}, {type:'bezier', p0:{x:100,y:80}, p1:{x:250,y:80}, p2:{x:250,y:200}, p3:{x:100,y:200}} ],
  'Q': [ {type:'move', p:{x:190,y:80}}, {type:'bezier', p0:{x:190,y:80}, p1:{x:80,y:80}, p2:{x:80,y:300}, p3:{x:190,y:300}}, {type:'bezier', p0:{x:190,y:300}, p1:{x:300,y:300}, p2:{x:300,y:80}, p3:{x:190,y:80}}, {type:'move', p:{x:230,y:230}}, {type:'line', p0:{x:230,y:230}, p1:{x:300,y:320}} ],
  'R': [ {type:'move', p:{x:100,y:320}}, {type:'line', p0:{x:100,y:320}, p1:{x:100,y:80}}, {type:'bezier', p0:{x:100,y:80}, p1:{x:250,y:80}, p2:{x:250,y:200}, p3:{x:100,y:200}}, {type:'move', p:{x:180,y:200}}, {type:'line', p0:{x:180,y:200}, p1:{x:280,y:320}} ],
  'S': [ {type:'move', p:{x:280,y:120}}, {type:'bezier', p0:{x:280,y:120}, p1:{x:200,y:50}, p2:{x:100,y:100}, p3:{x:100,y:150}}, {type:'bezier', p0:{x:100,y:150}, p1:{x:100,y:200}, p2:{x:280,y:200}, p3:{x:280,y:250}}, {type:'bezier', p0:{x:280,y:250}, p1:{x:280,y:300}, p2:{x:200,y:350}, p3:{x:100,y:280}} ],
  'T': [ {type:'move', p:{x:190,y:80}}, {type:'line', p0:{x:190,y:80}, p1:{x:190,y:320}}, {type:'move', p:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:280,y:80}} ],
  'U': [ {type:'move', p:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:100,y:250}}, {type:'bezier', p0:{x:100,y:250}, p1:{x:100,y:350}, p2:{x:280,y:350}, p3:{x:280,y:250}}, {type:'line', p0:{x:280,y:250}, p1:{x:280,y:80}} ],
  'V': [ {type:'move', p:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:190,y:320}}, {type:'line', p0:{x:190,y:320}, p1:{x:280,y:80}} ],
  'W': [ {type:'move', p:{x:80,y:80}}, {type:'line', p0:{x:80,y:80}, p1:{x:130,y:320}}, {type:'line', p0:{x:130,y:320}, p1:{x:190,y:160}}, {type:'line', p0:{x:190,y:160}, p1:{x:250,y:320}}, {type:'line', p0:{x:250,y:320}, p1:{x:300,y:80}} ],
  'X': [ {type:'move', p:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:280,y:320}}, {type:'move', p:{x:280,y:80}}, {type:'line', p0:{x:280,y:80}, p1:{x:100,y:320}} ],
  'Y': [ {type:'move', p:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:190,y:180}}, {type:'line', p0:{x:190,y:180}, p1:{x:280,y:80}}, {type:'move', p:{x:190,y:180}}, {type:'line', p0:{x:190,y:180}, p1:{x:190,y:320}} ],
  'Z': [ {type:'move', p:{x:100,y:80}}, {type:'line', p0:{x:100,y:80}, p1:{x:280,y:80}}, {type:'line', p0:{x:280,y:80}, p1:{x:100,y:320}}, {type:'line', p0:{x:100,y:320}, p1:{x:280,y:320}} ]
};

let content = fs.readFileSync('src/app/components/stroke-guide.component.ts', 'utf8');
const objStr = JSON.stringify(data, null, 4).replace(/"/g, "'");
content = content.replace(/private letterData: Record<string, Segment\[\]> = \{[\s\S]*?^  \};/m, `private letterData: Record<string, Segment[]> = ${objStr};`);
fs.writeFileSync('src/app/components/stroke-guide.component.ts', content);
