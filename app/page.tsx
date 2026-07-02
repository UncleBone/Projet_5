import Link from "next/link";
import Image from 'next/image'

export const App = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-8">
        <div className="flex justify-center">
          <Image
            src="/images/logo.png"
            alt="logo MDD"
            width={412}
            height={238}
            className="m-10"
            preload={true}
          />
        </div>

        <div className="flex gap-10 justify-center flex-col m-auto max-w-50 sm:flex-row sm:max-w-none">
          <Link
            href="/login"
            className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Se connecter
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            S'inscrire
          </Link>
        </div>
      </div>
    </div>
  );
};

export default App;
