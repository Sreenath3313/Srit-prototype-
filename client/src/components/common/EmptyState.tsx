import { FileX } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  description?: string;
  className?: string;
}

export default function EmptyState({ message, description, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <FileX className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium text-foreground mb-2">{message}</h3>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
