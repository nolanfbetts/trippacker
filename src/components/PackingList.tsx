import { ShoppingCartIcon } from '@heroicons/react/24/outline';

interface ProductRecommendation {
  name: string;
  description: string;
  affiliateLink: string;
}

interface PackingItem {
  name: string;
  description: string;
  recommendations: ProductRecommendation[];
}

interface Category {
  name: string;
  items: PackingItem[];
}

interface PackingListProps {
  categories: Category[];
}

export default function PackingList({ categories }: PackingListProps) {
  const getCategoryRecommendationsCount = (category: Category) => {
    return category.items.reduce((total, item) => total + item.recommendations.length, 0);
  };

  return (
    <div className="space-y-8">
      {categories.map((category) => {
        const recommendationsCount = getCategoryRecommendationsCount(category);
        
        return (
          <div key={category.name} className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold text-gray-900">{category.name}</h3>
                {recommendationsCount > 0 && (
                  <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-4 py-2 rounded-full">
                    <ShoppingCartIcon className="h-5 w-5 mr-2" />
                    <span>{recommendationsCount} recommendations</span>
                  </div>
                )}
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item) => (
                  <div key={item.name} className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
                    <div className="mb-4">
                      <h4 className="text-lg font-medium text-gray-900 mb-1">{item.name}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
                    </div>
                    
                    {item.recommendations.length > 0 && (
                      <div className="space-y-3">
                        {item.recommendations.map((product) => (
                          <a
                            key={product.name}
                            href={product.affiliateLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-start space-x-3 rounded-lg border border-gray-200 p-3 hover:border-blue-500 hover:shadow-md transition-all bg-white"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 mb-0.5">
                                {product.name}
                              </div>
                              <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                            </div>
                            <div className="flex-shrink-0">
                              <div className="rounded-lg bg-gray-50 p-2 group-hover:bg-blue-50 transition-colors">
                                <ShoppingCartIcon className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                              </div>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
} 