import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
            <main className="max-w-3xl w-full text-center py-20">
                <div
                    className="inline-flex items-center justify-center w-40 h-40 rounded-full bg-gradient-to-tr from-flamme/20 to-primary/30 mx-auto mb-8 shadow-lg"
                    aria-hidden
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        className="w-20 h-20 text-flamme"
                        aria-hidden
                    >
                        <circle
                            cx="11"
                            cy="11"
                            r="6.5"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M16 16l4 4"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </div>

                <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
                <h2 className="text-2xl font-semibold text-foreground/90 mb-4">Page non trouvée</h2>
                <p className="text-base text-muted-foreground max-w-xl mx-auto mb-6">
                    Oups — la page que vous cherchez n'existe pas ou a été déplacée. Si vous pensez
                    que c'est une erreur, contactez-nous.
                </p>

                <div className="flex items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-flamme text-white rounded-md shadow hover:brightness-95 transition"
                    >
                        Retour à l'accueil
                    </Link>

                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-6 py-3 border border-border bg-card text-foreground rounded-md hover:bg-secondary transition"
                    >
                        Aller au tableau de bord
                    </Link>
                </div>

                <p className="mt-8 text-xs text-muted-foreground">Code: 404 — Not Found</p>
            </main>
        </div>
    );
}