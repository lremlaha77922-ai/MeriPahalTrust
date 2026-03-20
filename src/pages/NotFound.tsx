import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-trust-blue">404</h1>
        <h2 className="text-4xl font-bold text-gray-900 mt-4 mb-4">
          पेज नहीं मिला
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          क्षमा करें, आप जो पेज खोज रहे हैं वह उपलब्ध नहीं है।
        </p>
        <Link to="/">
          <Button className="bg-trust-blue hover:bg-blue-800">
            <Home className="mr-2 h-4 w-4" />
            होम पेज पर जाएं
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;