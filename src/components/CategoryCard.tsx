import { Category } from '../types/index';

interface CategoryCardProps {
  category: Category;
  onClick: (categoryId: string) => void;
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  return (
    <div
      onClick={() => onClick(category.id)}
      className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      
      <div className="text-center">
        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {category.icon}
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-4 group-hover:text-blue-600 transition-colors">
          {category.name}
        </h3>
        
        <div className="flex justify-between pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {category.totalItems}
            </div>
            <div className="text-xs text-gray-500">Items</div>
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${category.expiringItems > 10 ? 'text-red-500' : category.expiringItems > 5 ? 'text-orange-500' : 'text-green-500'}`}>
              {category.expiringItems}
            </div>
            <div className="text-xs text-gray-500">Expiring</div>
          </div>
        </div>
      </div>
    </div>
  );
}