import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Problem } from '@/lib/mockData';
import { HeartPulse, Building2, Leaf, GraduationCap, Code, Brain, Lightbulb } from 'lucide-react';

interface ProblemStatementCardProps {
    problem: Problem;
    onViewDetails?: (problem: Problem) => void;
    actionLabel?: string;
    onAction?: (problem: Problem) => void;
    isActionSelected?: boolean;
    isActionDisabled?: boolean;
    actionVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const getIconForCategory = (category: string) => {
    const normalized = category.toLowerCase();
    if (normalized.includes('health')) return HeartPulse;
    if (normalized.includes('city') || normalized.includes('urban')) return Building2;
    if (normalized.includes('agri') || normalized.includes('environment')) return Leaf;
    if (normalized.includes('edu')) return GraduationCap;
    if (normalized.includes('tech') || normalized.includes('block') || normalized.includes('web')) return Code;
    if (normalized.includes('ai') || normalized.includes('ml') || normalized.includes('intelligence')) return Brain;
    return Lightbulb;
};

const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
        case 'Easy':
            return 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200';
        case 'Medium':
            return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200';
        case 'Hard':
            return 'bg-red-100 text-red-700 hover:bg-red-200 border-red-200';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

const ProblemStatementCard = ({
    problem,
    onViewDetails,
    actionLabel,
    onAction,
    isActionSelected,
    isActionDisabled,
    actionVariant = "default"
}: ProblemStatementCardProps) => {
    const Icon = getIconForCategory(problem.category);

    return (
        <Card className="hover:shadow-lg transition-all duration-300 border border-border/50 bg-card/50 backdrop-blur-sm group">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform duration-300">
                            <Icon className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="bg-background/50 text-xs font-normal text-muted-foreground border-border">
                                    {problem.id}
                                </Badge>
                                <Badge className={`border ${getDifficultyColor(problem.difficulty)} shadow-none`}>
                                    {problem.difficulty}
                                </Badge>
                            </div>
                            <CardTitle className="text-xl font-bold leading-tight text-foreground">
                                {problem.title}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground font-medium">
                                {problem.category}
                            </p>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-3">
                    {problem.description}
                </p>

                {problem.tags && problem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {problem.tags.map((tag, idx) => (
                            <Badge
                                key={idx}
                                variant="secondary"
                                className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-transparent px-3 py-1 rounded-full text-xs font-medium"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-3 pt-2">
                    <Button
                        className="bg-[#E85C33] hover:bg-[#D64B25] text-white shadow-md hover:shadow-lg transition-all"
                        onClick={() => onViewDetails?.(problem)}
                    >
                        View Details
                    </Button>

                    {actionLabel && (
                        <Button
                            variant={isActionSelected ? "secondary" : actionVariant}
                            onClick={() => onAction?.(problem)}
                            disabled={isActionDisabled}
                            className={isActionSelected ? "bg-green-100 text-green-700 hover:bg-green-200" : ""}
                        >
                            {actionLabel}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default ProblemStatementCard;
