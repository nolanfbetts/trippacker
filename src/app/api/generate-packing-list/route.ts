import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Your Amazon Associates ID
const AMAZON_AFFILIATE_ID = process.env.AMAZON_AFFILIATE_ID || 'trippacker-20';

// Function to generate Amazon affiliate link
function generateAmazonAffiliateLink(asin: string): string {
  return `https://www.amazon.com/dp/${asin}/ref=nosim?tag=${AMAZON_AFFILIATE_ID}`;
}

// Common product mappings with their ASINs
const PRODUCT_MAPPINGS = {
  // Clothing
  'uniqlo ultra light down jacket': {
    asin: 'B07XBN5DXN',
    name: 'Ultra Light Down Jacket',
    description: 'Lightweight, packable down jacket perfect for layering',
  },
  'columbia fleece jacket': {
    asin: 'B009P5JSGO',
    name: 'Columbia Men\'s Steens Mountain Full Zip Fleece Jacket',
    description: 'Warm and comfortable fleece jacket for cool weather',
  },
  
  // Travel Gear
  'anker powercore': {
    asin: 'B07S829LBX',
    name: 'Anker PowerCore 10000 Portable Charger',
    description: 'Ultra-compact 10000mAh power bank with PowerIQ technology',
  },
  'travel adapter': {
    asin: 'B07T66GG68',
    name: 'EPICKA Universal Travel Adapter',
    description: 'All-in-one international power adapter with USB ports',
  },
  
  // Comfort
  'hydro flask': {
    asin: 'B083GB6VGC',
    name: 'Hydro Flask Water Bottle with Flex Cap',
    description: 'Vacuum insulated stainless steel water bottle, keeps drinks cold for 24 hours',
  },
  'neck pillow': {
    asin: 'B07KRFQMS7',
    name: 'BCOZZY Chin Supporting Travel Pillow',
    description: 'Ergonomic neck pillow with chin support for comfortable travel',
  },
} as const;

export async function POST(request: Request) {
  try {
    const { startDate, endDate, location, activities } = await request.json();

    const prompt = `Generate a detailed packing list for a trip to ${location} from ${startDate} to ${endDate}. ${
      activities ? `The planned activities include: ${activities}.` : ''
    }

Please provide specific product recommendations that would be available on Amazon.com. Focus on practical, highly-rated items that travelers would actually need.

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
              "description": "Brief product description with key features",
              "productKey": "key that matches common products mapping"
            }
          ]
        }
      ]
    }
  ]
}

Focus on essential items and popular brands available on Amazon. Be specific with product names and include well-known brands.
Consider weather, activities, and practical needs. Prioritize items with good reviews and reliable brands.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a travel packing expert who creates detailed, personalized packing lists with specific product recommendations. Focus on practical, well-reviewed items from reputable brands available on Amazon."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const rawPackingList = JSON.parse(completion.choices[0].message.content || '{}');

    // Process the packing list to add affiliate links
    const processedPackingList = {
      ...rawPackingList,
      categories: rawPackingList.categories.map((category: any) => ({
        ...category,
        items: category.items.map((item: any) => ({
          ...item,
          recommendations: item.recommendations.map((rec: any) => {
            const productKey = rec.productKey?.toLowerCase();
            const mappedProduct = productKey && PRODUCT_MAPPINGS[productKey as keyof typeof PRODUCT_MAPPINGS];
            
            if (mappedProduct) {
              return {
                name: mappedProduct.name,
                description: mappedProduct.description,
                affiliateLink: generateAmazonAffiliateLink(mappedProduct.asin)
              };
            }
            
            // Fallback for products not in our mapping
            return {
              name: rec.name,
              description: rec.description,
              affiliateLink: `https://www.amazon.com/s?k=${encodeURIComponent(rec.name)}&tag=${AMAZON_AFFILIATE_ID}`
            };
          })
        }))
      }))
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