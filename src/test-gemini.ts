// src/test-gemini.ts
// Run with: npx ts-node src/test-gemini.ts

import fs from 'fs/promises';
import dotenv from 'dotenv';

// Load environment variables from .env
dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

async function testGemini() {
    console.log('=== Gemini API Test ===\n');

    // Check API key
    if (!GEMINI_API_KEY) {
        console.error('❌ No API key found!');
        console.log('Set GEMINI_API_KEY or GOOGLE_API_KEY in your .env file');
        return;
    }
    console.log(`✓ API Key: ${GEMINI_API_KEY.slice(0, 10)}...${GEMINI_API_KEY.slice(-4)}`);

    // Test models
    const models = ['gemini-2.0-flash', 'gemini-2.5-flash'];

    for (const model of models) {
        console.log(`\n--- Testing model: ${model} ---`);

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{ text: 'Say "Hello, I am working!" and nothing else.' }]
                        }],
                        generationConfig: {
                            temperature: 0.1,
                            maxOutputTokens: 100
                        }
                    })
                }
            );

            console.log(`Status: ${response.status} ${response.statusText}`);

            const data = await response.json();

            if (data.error) {
                console.log(`❌ Error: ${data.error.message}`);
            } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
                console.log(`✓ Response: ${data.candidates[0].content.parts[0].text}`);
            } else {
                console.log('❌ Unexpected response structure:');
                console.log(JSON.stringify(data, null, 2).slice(0, 500));
            }

        } catch (e: any) {
            console.log(`❌ Exception: ${e.message}`);
        }
    }

    // Test with image
    console.log('\n--- Testing with image ---');

    // Create a simple test image (1x1 red pixel PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { inline_data: { mime_type: 'image/png', data: testImageBase64 } },
                            { text: 'What color is this image? Reply with just the color name.' }
                        ]
                    }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 100
                    }
                })
            }
        );

        console.log(`Status: ${response.status} ${response.statusText}`);

        const data = await response.json();

        if (data.error) {
            console.log(`❌ Error: ${data.error.message}`);
        } else if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
            console.log(`✓ Response: ${data.candidates[0].content.parts[0].text}`);
        } else {
            console.log('Response structure:');
            console.log(JSON.stringify(data, null, 2).slice(0, 500));
        }

    } catch (e: any) {
        console.log(`❌ Exception: ${e.message}`);
    }

    console.log('\n=== Test Complete ===');
}

testGemini().catch(console.error);
