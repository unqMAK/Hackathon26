import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Problem from '../models/Problem';
import connectDB from '../config/db';

dotenv.config();

const problems = [
    {
        title: "Smart Road Damage Reporting & Rapid Response System for Solapur Municipal Corporation",
        category: "Smart City / Infrastructure",
        description: `Context:
Solapur city frequently experiences road damage such as potholes, cracks, and surface failures due to heavy monsoons, ongoing construction activities, underground utility works, and high traffic loads. These damages pose serious safety risks, disrupt traffic movement, and lead to increased public dissatisfaction.
At present, Solapur Municipal Corporation lacks a centralized, real-time, technology-driven platform for systematic reporting, verification, prioritization, and monitoring of road damage complaints across departments.

Problem Description:
Solapur Municipal Corporation requires an integrated digital solution to address the following challenges:

1. Efficient Detection and Reporting of Road Damage
• Citizens face difficulty in reporting potholes and road damage through existing mechanisms.
• Absence of geo-tagged, time-stamped, and visual evidence-based reporting.
• Delays in verification and response due to fragmented communication.

2. Multi-Departmental Coordination
Road damage may occur due to heavy rainfall and flooding, construction and excavation activities, underground utility repairs (water supply, drainage, electricity, telecom), poor construction quality, and heavy vehicular load. Multiple departments such as Engineering, Ward Offices, Traffic, and Disaster Management are involved, but no unified digital workflow exists for coordination and accountability.

3. Real-Time Monitoring and Accountability
• Citizens do not receive timely updates on complaint status.
• Officials lack centralized dashboards for tracking resolution timelines and contractor performance.
• Manual and paper-based processes reduce transparency and efficiency.`,
        difficulty: "Hard",
        tags: ["AI", "GIS", "Mobile App", "Infrastructure", "IoT"],
        type: "Software"
    },
    {
        title: "Smart Health Solutions for Solapur Municipal Corporation",
        category: "Healthcare / Public Health",
        description: `Context:
Solapur Municipal Corporation serves a rapidly expanding urban population with diverse healthcare needs. Despite ongoing public health initiatives, the city continues to face challenges such as unequal access to healthcare services, delayed outbreak detection, fragmented health data systems, limited preventive healthcare awareness, and lack of real-time visibility into public health infrastructure.
The COVID-19 pandemic further highlighted the importance of real-time, integrated, and technology-driven healthcare systems to strengthen preventive care, emergency response, and informed decision-making at the municipal level.

Problem Description:
Solapur Municipal Corporation requires a unified digital health ecosystem to address the following challenges:

1. Fragmented Health Data and Limited Visibility
• Health data is siloed across hospitals, clinics, laboratories, and government programs.
• Absence of standardized, real-time health data analytics for planning and monitoring.
• Limited ward-wise and zone-wise visibility of health indicators.

2. Delayed Disease Detection and Response
• Inadequate predictive systems for early detection of disease outbreaks.
• Lack of real-time surveillance for communicable and non-communicable diseases.
• Difficulty in identifying high-risk populations and vulnerable zones.

3. Limited Citizen-Centric Digital Health Services
• Insufficient digital platforms for appointments, telemedicine, vaccination alerts, and emergency services.
• Low awareness and engagement in preventive healthcare and wellness programs.
• Limited accessibility for diverse and multilingual populations.

4. Inefficient Monitoring of Public Health Infrastructure
• Lack of real-time tracking of hospital bed availability, equipment condition, and medicine stocks.
• Manual processes reduce efficiency, transparency, and accountability.`,
        difficulty: "Medium",
        tags: ["Healthcare", "AI", "Telemedicine", "Analytics", "Public Health"],
        type: "Software"
    },
    {
        title: "Smart Water Pressure Management for Equitable Water Supply in Solapur Municipal Corporation",
        category: "Smart Water / IoT",
        description: `Context:
Solapur Municipal Corporation provides drinking water to more than 10 lakh citizens across multiple water distribution zones. Despite continuous infrastructure development and operational efforts, the city continues to face challenges related to uneven water pressure, irregular supply, and significant water losses.
Areas located at higher elevations and tail-end zones frequently experience low water pressure and inadequate supply, leading to citizen dissatisfaction and inequitable access. Additionally, aging pipelines, leakages, unauthorized consumption, and manual valve operations result in high non-revenue water and operational inefficiencies.
The absence of real-time monitoring, automation, and data-driven decision support limits SMC's ability to respond proactively and plan efficiently, necessitating the adoption of smart water management solutions.

Problem Description:
Solapur Municipal Corporation requires an integrated, intelligent water management solution to address the following challenges:

1. Uneven Water Pressure and Distribution
• Low pressure in elevated and tail-end areas.
• Unequal water distribution across zones and wards.
• Irregular and unpredictable water supply schedules.

2. Water Losses and Infrastructure Inefficiencies
• Leakages and bursts in aging pipelines.
• Manual valve and pump operations leading to human error.
• Unauthorized consumption and undetected losses.

3. Lack of Real-Time Visibility and Decision Support
• No real-time data on pressure, flow, and consumption patterns.
• Delayed detection of faults and pressure drops.
• Limited analytical tools for demand forecasting and planning.`,
        difficulty: "Hard",
        tags: ["IoT", "Sensors", "Analytics", "Water Management", "Automation"],
        type: "Hardware"
    },
    {
        title: "Smart Safety and Assistance System for Sanitation Workers of Solapur Municipal Corporation",
        category: "Safety / Worker Welfare",
        description: `Context:
Sanitation workers of Solapur Municipal Corporation perform critical public health and hygiene functions under extremely challenging and hazardous conditions. Their daily responsibilities often involve exposure to extreme weather, entry into confined spaces such as manholes and sewer lines, handling blocked pipelines, and performing high-risk manual operations.
These working conditions expose sanitation workers to severe health risks, including toxic gases, infections, structural failures, and accidental flooding. Despite their essential role, many sanitation operations continue to rely on manual processes with limited safety mechanisms or technology support.
To promote worker dignity, life safety, and operational efficiency, SMC seeks innovative, practical, and scalable technology-driven solutions that can significantly reduce occupational risks and prevent loss of life or injury.

Problem Description:
Solapur Municipal Corporation requires a comprehensive safety and support system to address the following challenges:

1. High Risk Due to Manual Exposure
• Direct human entry into manholes and sewer lines.
• Limited availability of mechanized or remote inspection tools.
• Dependence on manual cleaning and maintenance operations.

2. Health and Life Safety Hazards
• Exposure to toxic and explosive gases.
• Risk of suffocation, infections, and long-term health issues.
• Possibility of structural collapse or sudden flooding.

3. Lack of Real-Time Monitoring and Emergency Response
• Absence of real-time gas detection and environmental monitoring.
• No immediate alert mechanisms during emergencies.
• Limited visibility for supervisors during field operations.`,
        difficulty: "Hard",
        tags: ["IoT", "Safety", "Wearables", "Robotics", "Health"],
        type: "Hardware"
    },
    {
        title: "Smart Traffic and Parking Management System for Solapur Municipal Corporation",
        category: "Smart Mobility / Traffic",
        description: `Context:
Solapur city is experiencing rapid urban growth, resulting in increased vehicular movement and pressure on existing road infrastructure. Major congestion is frequently observed near bus stands, railway stations, markets, educational institutions, hospitals, malls, and commercial zones.
Traffic flow is further disrupted due to improper parking, roadside hawkers, unregulated vending activities, and lack of scientific traffic planning. The absence of real-time traffic data, automated control systems, and digital monitoring tools leads to increased travel delays, road accidents, air pollution, and citizen inconvenience.
To progress towards a smarter, safer, and more efficient urban mobility ecosystem, Solapur Municipal Corporation requires a modern, technology-driven traffic and parking management solution.

Problem Description:
Solapur Municipal Corporation requires an integrated mobility management platform to address the following challenges:

1. Traffic Congestion and Inefficient Flow
• High congestion at major junctions and peak-hour zones.
• Static signal timings that do not adapt to real-time traffic conditions.
• Lack of route optimization during peak hours, events, and emergencies.

2. Obstructions and Unauthorized Activities
• Traffic disruptions caused by hawkers, roadside vendors, and illegal parking.
• No automated detection or geo-mapping of recurring bottlenecks.
• Delayed enforcement response due to manual monitoring.

3. Inefficient Parking Management
• Limited visibility of available parking spaces.
• Absence of digital parking reservation or guidance systems.
• Poor differentiation between legal and illegal parking areas.

4. Lack of Data-Driven Planning
• No centralized analytics on traffic density, congestion trends, or peak demand.
• Limited use of predictive insights for planning during school hours, market days, festivals, or public events.`,
        difficulty: "Medium",
        tags: ["AI", "Traffic", "IoT", "Smart Parking", "Analytics"],
        type: "Software"
    }
];

const seedProblems = async () => {
    try {
        await connectDB();

        console.log('Clearing existing problems...');
        await Problem.deleteMany({});

        console.log('Seeding 5 new problem statements...');
        await Problem.insertMany(problems);

        console.log('✅ Problem statements seeded successfully!');
        console.log(`   - Total: ${problems.length} problems`);
        console.log(`   - Software: ${problems.filter(p => p.type === 'Software').length}`);
        console.log(`   - Hardware: ${problems.filter(p => p.type === 'Hardware').length}`);

        process.exit();
    } catch (error) {
        console.error('❌ Error seeding problems:', error);
        process.exit(1);
    }
};

seedProblems();
