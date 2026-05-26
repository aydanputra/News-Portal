
import Header from "../classic/components/Header"; // Gunakan header yang sudah ada
import Footer from "../classic/components/Footer"; // Gunakan footer yang sudah ada

interface HomeProps {
  data: {
    posts: any[];
    categories: any[];
    blocks: any[];
    setting?: any;
    blockData?: Record<string, any[]>;
  };
}

export default function SkeletonHome({ data }: HomeProps) {
  const { posts, setting } = data;
  const siteName = setting?.siteName || "Skeleton Theme";
  
  return (
    <div className="public-theme min-h-screen bg-gray-100">
      <Header 
        siteName={siteName} 
        categories={data.categories} 
      />

      <main className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-4xl font-bold mb-4">Hello from Skeleton Theme!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Ini adalah tema dasar yang bisa Anda kembangkan sendiri.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           {posts.slice(0, 3).map(post => (
             <div key={post.id} className="bg-white p-6 rounded shadow">
                <h2 className="font-bold text-lg mb-2">{post.title}</h2>
                <p className="text-gray-500 text-sm">
                  {new Date(post.publishedAt).toLocaleDateString()}
                </p>
             </div>
           ))}
        </div>
      </main>

      <Footer siteName={siteName} />
    </div>
  );
}
