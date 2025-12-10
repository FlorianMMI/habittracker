import Link from "next/link";


interface LinkNavProps {
    name: string;
    path: string;
    onClose?: () => void;
}

export default function LinkNav({ name, path, onClose }: LinkNavProps) {
    return (
        <>
                <Link 
                href={`/${path}`}
                className="block text-base text-foreground font-medium hover:text-primary transition-colors" 
                onClick={onClose}
            >
                {name}
            </Link>
        </>
    )

}