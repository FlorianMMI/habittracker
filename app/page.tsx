import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            HabitTracker
          </h1>
          <p className="text-muted-foreground text-lg">
            Suivez vos habitudes quotidiennes et atteignez vos objectifs
          </p>
        </div>
        
        <div className="space-y-4">
          <Link 
            href="/login"
            className="block w-full bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            Se connecter
          </Link>
          
          <Link 
            href="/register"
            className="block w-full bg-secondary text-secondary-foreground hover:bg-secondary/80 font-medium py-3 px-4 rounded-lg transition-colors"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
}
