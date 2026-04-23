const fs = require('fs');

const file = 'src/data/tutors.ts';
let code = fs.readFileSync(file, 'utf8');

const istanbulLocations = [
    'Kadıköy, Istanbul',
    'Beşiktaş, Istanbul',
    'Şişli, Istanbul',
    'Üsküdar, Istanbul',
    'Fatih, Istanbul',
    'Beyoğlu, Istanbul',
    'Bakırköy, Istanbul',
    'Maltepe, Istanbul',
    'Sarıyer, Istanbul',
    'Ataşehir, Istanbul',
    'Ümraniye, Istanbul',
    'Kartal, Istanbul'
];

let locIndex = 0;
code = code.replace(/location:\s*"([^"]+)"/g, (match, oldLoc) => {
    const newLoc = istanbulLocations[locIndex % istanbulLocations.length];
    locIndex++;
    return `location: "${newLoc}"`;
});

fs.writeFileSync(file, code);
console.log('tutors.ts updated');
