import fs from 'fs';

const syllabusContent = `CLASS 10 MATHEMATICS SYLLABUS

CHAPTER 1: REAL NUMBERS
Euclid's Division Algorithm: For any two positive integers a and b, there exist unique integers q and r such that a = bq + r, where 0 ≤ r < b.
Fundamental Theorem of Arithmetic: Every composite number can be uniquely expressed as a product of prime numbers, except for the order of factors.
Key concepts: Irrational numbers, decimal expansions of rational and irrational numbers, proving irrationality of sqrt(2) and sqrt(3).
Important questions: Find HCF and LCM using prime factorization. Prove that sqrt(2) is irrational.

CHAPTER 2: POLYNOMIALS  
Polynomial division algorithm: When polynomial p(x) is divided by g(x), q(x) is quotient and r(x) is remainder, p(x) = g(x).q(x) + r(x).
Zeros of polynomial: A value x = a is zero of p(x) if p(a) = 0. Graphically, zeros are x-intercepts.
Factor Theorem: (x-a) is factor of p(x) if and only if p(a) = 0.
Relationship between coefficients and zeros: For quadratic ax²+bx+c with zeros α and β: sum = -b/a, product = c/a.
Important questions: Divide polynomials, find zeros, verify factor theorem, factorize polynomials.

CHAPTER 3: PAIR OF LINEAR EQUATIONS IN TWO VARIABLES
Graphical method: Two lines can intersect (unique solution), be parallel (no solution), or coincident (infinite solutions).
Algebraic methods: Substitution method, elimination method, cross-multiplication method.
Consistency: Consistent (unique or infinite solutions), inconsistent (no solution).
Applications: Word problems involving ages, distances, work rates, mixture problems.
Important questions: Solve systems of equations, check consistency, solve real-world problems.

CHAPTER 4: QUADRATIC EQUATIONS
Standard form: ax²+bx+c=0 where a≠0.
Factorization method: Express as product of linear factors.
Completing the square: Convert to (x+p)²=q form.
Quadratic formula: x = [-b ± sqrt(b²-4ac)] / 2a
Discriminant: Δ = b²-4ac. If Δ>0 (distinct real roots), Δ=0 (equal roots), Δ<0 (no real roots).
Sum and product of roots: Sum = -b/a, Product = c/a.
Important questions: Solve using all methods, find nature of roots, real-life applications.

CHAPTER 5: ARITHMETIC PROGRESSIONS
nth term: aₙ = a + (n-1)d where a is first term, d is common difference.
Sum formula: Sₙ = n/2[2a + (n-1)d] or Sₙ = n/2[a + l] where l is last term.
Finding terms: If three terms in AP: a-d, a, a+d. If four terms: a-3d, a-d, a+d, a+3d.
Applications: Summing natural numbers, arithmetic sequences in real life.
Important questions: Find specific terms, find sum to n terms, solve application problems.

CHAPTER 6: TRIANGLES
Similar triangles: AA (angle-angle), SSS (side-side-side), SAS (side-angle-side) similarity criteria.
Basic Proportionality Theorem: If line parallel to one side of triangle, it divides other sides proportionally.
Angle Bisector Theorem: Angle bisector divides opposite side in ratio of adjacent sides.
Pythagoras Theorem: In right triangle, a²+b²=c² where c is hypotenuse.
Important questions: Prove similarity, use BPT, find unknown sides, apply Pythagoras theorem.

CHAPTER 7: COORDINATE GEOMETRY
Distance formula: d = sqrt[(x₂-x₁)² + (y₂-y₁)²]
Section formula: Point dividing (x₁,y₁) and (x₂,y₂) in ratio m:n is [(mx₂+nx₁)/(m+n), (my₂+ny₁)/(m+n)]
Area of triangle: Area = (1/2)|x₁(y₂-y₃) + x₂(y₃-y₁) + x₃(y₁-y₂)|
Collinearity: Three points collinear if area = 0.
Important questions: Find distances between points, find dividing points, find areas, check collinearity.

CHAPTER 8: INTRODUCTION TO TRIGONOMETRY  
Trigonometric ratios: sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent.
Other ratios: cosec θ = 1/sin θ, sec θ = 1/cos θ, cot θ = 1/tan θ, tan θ = sin θ/cos θ.
Identities: sin²θ + cos²θ = 1, 1 + tan²θ = sec²θ, 1 + cot²θ = cosec²θ.
Complementary angles: sin(90°-θ) = cos θ, cos(90°-θ) = sin θ.
Standard values: sin 0°=0, sin 30°=1/2, sin 45°=1/√2, sin 60°=√3/2, sin 90°=1.
Important questions: Find trigonometric ratios, verify identities, solve trigonometric equations.

CHAPTER 9: APPLICATIONS OF TRIGONOMETRY
Heights and Distances: Use trigonometry to find unknown heights or distances.
Angle of Elevation: Angle above horizontal when looking up.
Angle of Depression: Angle below horizontal when looking down.
Applications: Ladders against walls, buildings and objects on ground, ships and lighthouses.
Important questions: Solve real-world problems involving heights, distances, angles.

CHAPTER 10: CIRCLES
Tangent properties: Tangent is perpendicular to radius at point of contact.
Number of tangents: Zero tangents from inside, one from on circle, two from outside circle.
Length of tangent: If PA and PB are tangents from external point P, then PA = PB.
Tangent-secant angles: Angle between tangent and chord equals inscribed angle in alternate segment.
Important questions: Find tangent lengths, prove tangent properties, angle calculations.

CHAPTER 11: CONSTRUCTIONS
Division of line segment: Divide AB in ratio m:n using compass and straightedge.
Tangent construction: Construct tangents to circle from external point.
Similar triangle: Construct triangle similar to given triangle with given scale factor.

CHAPTER 12: AREAS RELATED TO CIRCLES
Circle area: A = πr²
Circle circumference: C = 2πr  
Sector area: A = (θ/360°) × πr²
Segment area: Area = Area of sector - Area of triangle
Arc length: l = (θ/360°) × 2πr
Important questions: Find areas and arc lengths of sectors and segments.

CHAPTER 13: SURFACE AREAS AND VOLUMES
Cube: Surface area = 6a², Volume = a³
Cuboid: Surface area = 2(lb+bh+hl), Volume = lbh
Cylinder: Lateral surface area = 2πrh, Total surface area = 2πrh + 2πr², Volume = πr²h
Cone: Lateral surface area = πrl, Total surface area = πrl + πr², Volume = (1/3)πr²h
Sphere: Surface area = 4πr², Volume = (4/3)πr³
Important questions: Calculate surface areas and volumes, solve composite figures.

CHAPTER 14: STATISTICS
Mean for grouped data: Mean = Σfᵢxᵢ / Σfᵢ where xᵢ is class mark, fᵢ is frequency.
Median: Middle value when data arranged in order. For grouped data, use median class formula.
Mode: Most frequently occurring value. Modal class has highest frequency.
Range, variance, standard deviation: Measures of dispersion or spread of data.
Important questions: Calculate mean, median, mode; find measures of dispersion.

CHAPTER 15: PROBABILITY
Theoretical probability: P(E) = Number of favorable outcomes / Total number of outcomes
Experimental probability: Based on actual experiments or frequency data.
Complementary events: P(E) + P(E') = 1
Compound events: P(A or B) = P(A) + P(B) - P(A and B)
Independent events: P(A and B) = P(A) × P(B)
Important questions: Calculate probabilities of simple and compound events.`;

// Create a minimal PDF that actually contains the text
let pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${syllabusContent.length + 200} >>
stream
BT
/F1 9 Tf
50 750 Td
`;

// Add syllabus content as text
const lines = syllabusContent.split('\n');
for (const line of lines) {
  const escaped = line.replace(/[()\\]/g, '\\$&');
  pdfContent += `(${escaped}) Tj\n0 -10 Td\n`;
}

pdfContent += `ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000247 00000 n 
${String(pdfContent.length - 100).padStart(10, '0')} 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
${pdfContent.length}
%%EOF`;

fs.writeFileSync('complete-syllabus.pdf', pdfContent, 'utf8');
console.log('✓ Complete syllabus PDF created with full chapter details');
