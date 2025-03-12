import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { PackingList, Category, RawProductRecommendation } from '@/types/packing';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Your Amazon Associates ID
const AMAZON_AFFILIATE_ID = process.env.AMAZON_AFFILIATE_ID || 'trippacker-20';

// Constants for timeouts and delays
const AMAZON_REQUEST_TIMEOUT = 5000; // 5 seconds timeout for Amazon requests
const DELAY_BETWEEN_REQUESTS = 500; // 500ms delay between requests
const MAX_CONCURRENT_REQUESTS = 3; // Maximum number of concurrent requests

// Function to generate Amazon affiliate link
function generateAmazonAffiliateLink(asin: string): string {
  return `https://www.amazon.com/dp/${asin}/ref=nosim?tag=${AMAZON_AFFILIATE_ID}`;
}

// Function to search Amazon and get the first product's ASIN with timeout
async function searchAmazonAndGetAsin(productName: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AMAZON_REQUEST_TIMEOUT);

    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(productName)}&ref=nb_sb_noss_2&rh=n%3A283155%2Cp_85%3A2470955011`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    
    if (!response.ok) {
      console.error(`Failed to fetch Amazon search results: ${response.status} ${response.statusText}`);
      return null;
    }

    const html = await response.text();
    
    // Try to find ASIN using various patterns
    const patterns = [
      /data-asin="([A-Z0-9]{10})"[^>]*data-index="1"/,
      /data-asin="([A-Z0-9]{10})"[^>]*data-component-type="s-search-result"/,
      /\/dp\/([A-Z0-9]{10})(?:\/|\?|$)/,
      /"asin":"([A-Z0-9]{10})"/,
      /data-asin="([A-Z0-9]{10})"/
    ];

    for (const pattern of patterns) {
      const match = html.match(pattern);
      if (match && match[1] && /^[A-Z0-9]{10}$/.test(match[1])) {
        return match[1];
      }
    }

    return null;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.warn(`Amazon search timed out for: ${productName}`);
      } else {
        console.error('Error searching Amazon:', error);
      }
    } else {
      console.error('Unknown error searching Amazon:', error);
    }
    return null;
  }
}

// Process recommendations in batches to limit concurrent requests
async function processBatch(recommendations: RawProductRecommendation[], startIndex: number, batchSize: number) {
  const batch = recommendations.slice(startIndex, startIndex + batchSize);
  const results = await Promise.all(
    batch.map(async (rec) => {
      try {
        const asin = await searchAmazonAndGetAsin(rec.name);
        return {
          name: rec.name,
          description: rec.description,
          affiliateLink: asin 
            ? generateAmazonAffiliateLink(asin)
            : `https://www.amazon.com/s?k=${encodeURIComponent(rec.name)}&tag=${AMAZON_AFFILIATE_ID}`
        };
      } catch (error) {
        console.error(`Error processing recommendation for ${rec.name}:`, error);
        return {
          name: rec.name,
          description: rec.description,
          affiliateLink: `https://www.amazon.com/s?k=${encodeURIComponent(rec.name)}&tag=${AMAZON_AFFILIATE_ID}`
        };
      }
    })
  );
  
  if (startIndex + batchSize < recommendations.length) {
    await delay(DELAY_BETWEEN_REQUESTS);
  }
  
  return results;
}

// Process all recommendations with batching
async function processAllRecommendations(recommendations: RawProductRecommendation[]) {
  const results = [];
  for (let i = 0; i < recommendations.length; i += MAX_CONCURRENT_REQUESTS) {
    const batchResults = await processBatch(recommendations, i, MAX_CONCURRENT_REQUESTS);
    results.push(...batchResults);
  }
  return results;
}

// Add delay between requests
function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  try {
    const { startDate, endDate, location, activities, gender, priceRange } = await request.json();

    // Build the prompt with optional parameters
    let prompt = `Generate a detailed packing list for a trip to ${location} from ${startDate} to ${endDate}.`;
    
    if (activities) {
      prompt += `\n\nThe planned activities include: ${activities}.`;
    }
    
    if (gender) {
      prompt += `\nThe packing list is for a ${gender} traveler.`;
    }
    
    if (priceRange) {
      const priceRangeDescriptions = {
        'budget': 'budget-friendly items',
        'mid-range': 'mid-range items',
        'premium': 'premium quality items'
      };
      prompt += `\nPlease focus on ${priceRangeDescriptions[priceRange as keyof typeof priceRangeDescriptions]}.`;
    }

    prompt += `\n\nPlease provide specific product recommendations that would be available on Amazon.com. Focus on practical, highly-rated items that travelers would actually need. Make sure to include appropriate weather-specific items based on the weather information provided.

Please provide a structured response in the following JSON format:
{
  "categories": [
    {
      "name": "Category Name",
      "items": [
        {
          "name": "Item Name",
          "description": "Brief description of why this item is important",
          "recommendations": [
            {
              "name": "Specific Product Name (include brand)",
              "description": "Brief product description with key features"
            }
          ]
        }
      ]
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a travel packing expert who creates detailed, personalized packing lists with specific product recommendations. Focus on practical, well-reviewed items from reputable brands available on Amazon. ${
            gender ? `Consider gender-specific needs and preferences.` : ''
          } ${
            priceRange ? `Focus on products within the specified price range.` : ''
          } Please limit recommendations to 2-3 items per category to ensure efficient processing.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const rawPackingList = JSON.parse(completion.choices[0].message.content || '{}') as PackingList;

    // Process the packing list to add affiliate links with optimized concurrent processing
    const processedPackingList: PackingList = {
      categories: await Promise.all(rawPackingList.categories.map(async (category: Category) => ({
        ...category,
        items: await Promise.all(category.items.map(async (item) => ({
          ...item,
          recommendations: await processAllRecommendations(item.recommendations)
        })))
      })))
    };

    return NextResponse.json(processedPackingList);
  } catch (error) {
    console.error('Error generating packing list:', error);
    return NextResponse.json(
      { error: 'Failed to generate packing list' },
      { status: 500 }
    );
  }
} 