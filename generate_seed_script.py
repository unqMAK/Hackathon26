import json
import re

def parse_problem(content, filename):
    lines = [l.strip() for l in content.split('\n') if l.strip()]
    
    title = ""
    description = content
    category = "General"
    difficulty = "Medium"
    tags = []
    
    # Try to find title
    for i, line in enumerate(lines):
        if "Title" in line and len(line) < 100:
            title = line.split("Title")[-1].strip(":").strip()
            if not title and i + 1 < len(lines):
                title = lines[i+1]
            break
    
    if not title:
        # Fallback to first line or filename
        title = lines[0] if lines else filename.replace('.docx', '')

    # Try to find category
    if "Health" in title or "Health" in content:
        category = "Healthcare"
        tags.extend(["Healthcare", "Wellness"])
    elif "Traffic" in title or "Road" in title:
        category = "Smart City"
        tags.extend(["Smart City", "Traffic", "Infrastructure"])
    elif "Water" in title:
        category = "Smart Water"
        tags.extend(["Water Management", "IoT"])
    elif "Sanitation" in title:
        category = "Sanitation"
        tags.extend(["Sanitation", "Safety", "IoT"])
    elif "HR" in title or "Resource" in title:
        category = "Governance"
        tags.extend(["HR", "Management", "Governance"])
    
    # Refine description
    # Remove title from description if possible
    
    return {
        "title": title,
        "category": category,
        "description": description.replace('"', '\\"').replace('\n', '\\n'),
        "difficulty": difficulty,
        "tags": tags
    }

with open('extracted_raw_problems.json', 'r', encoding='utf-8') as f:
    raw_problems = json.load(f)

ts_content = """import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem';
import connectDB from '../config/db';

dotenv.config();

const problems = [
"""

for p in raw_problems:
    parsed = parse_problem(p['content'], p['filename'])
    ts_content += "    {\n"
    ts_content += f'        title: "{parsed["title"]}",\n'
    ts_content += f'        category: "{parsed["category"]}",\n'
    ts_content += f'        description: "{parsed["description"]}",\n'
    ts_content += f'        difficulty: "{parsed["difficulty"]}",\n'
    ts_content += f'        tags: {json.dumps(parsed["tags"])}\n'
    ts_content += "    },\n"

ts_content += """];

const seedProblems = async () => {
    try {
        await connectDB();

        console.log('Clearing existing problems...');
        await Problem.deleteMany({});

        console.log('Seeding new problems...');
        await Problem.insertMany(problems);

        console.log('Problems seeded successfully!');
        process.exit();
    } catch (error) {
        console.error('Error seeding problems:', error);
        process.exit(1);
    }
};

seedProblems();
"""

with open('server/src/scripts/seedExtractedProblems.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print("Generated server/src/scripts/seedExtractedProblems.ts")
