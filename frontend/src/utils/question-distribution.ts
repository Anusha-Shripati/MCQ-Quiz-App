import { Question } from '@/shared/types/app';

type Difficulty = 'easy' | 'medium' | 'hard';
type QuestionType = Question['type'];

const TARGET_CATEGORIES: QuestionType[] = [
  'multiple_select',
  'mcq',
  'code_snippet',
  'code_snippet_with_mcq',
];

interface DistributionInput {
  totalTarget: number;
  difficultyDist: { easy: number; medium: number; hard: number }; // Percentages e.g. 30, 40, 30
  technologies: { id: string; name: string }[];
  limits: any; // Using any for flexibility with SWR data
}

interface DifficultyResult {
    total: number;
    [key: string]: number; // Allow dynamic access for question types
}

interface DistributionResult {
  [techId: string]: {
    easy: DifficultyResult;
    medium: DifficultyResult;
    hard: DifficultyResult;
    [key: string]: any;
  };
}

export const distributeQuestions = (input: DistributionInput): DistributionResult => {
  const { totalTarget, difficultyDist, technologies, limits } = input;
  const result: DistributionResult = {};

  // Initialize result structure
  technologies.forEach((tech) => {
    result[tech.id] = {
      easy: { total: 0 },
      medium: { total: 0 },
      hard: { total: 0 },
    };
  });

  const easyTarget = Math.round(totalTarget * (difficultyDist.easy / 100));
  const mediumTarget = Math.round(totalTarget * (difficultyDist.medium / 100));
  // Ensure total sum is exactly totalTarget by assigning remainder to last or largest
  const hardTarget = totalTarget - easyTarget - mediumTarget;

  const difficultyGlobalTargets: Record<Difficulty, number> = {
    easy: easyTarget,
    medium: mediumTarget,
    hard: hardTarget,
  };

  (['easy', 'medium', 'hard'] as Difficulty[]).forEach((difficulty) => {
    let globalNeeded = difficultyGlobalTargets[difficulty];
    if (globalNeeded <= 0) return;

    // Calculate max capacity per tech for this difficulty
    const techCapacities = technologies.map(tech => {
       const limitObj = limits?.data?.results?.[tech.id]?.[difficulty] || {};
       let max = 0;
       TARGET_CATEGORIES.forEach(cat => {
           max += (typeof limitObj[cat] === 'number' ? limitObj[cat] : 0);
       });
       return { id: tech.id, max, allocated: 0, limitObj };
    });

    // Distribute globalNeeded among techs
    // Try even distribution first
    // Then fill remaining globalNeeded by checking who has capacity
    
    while (globalNeeded > 0) {
        const availableTechs = techCapacities.filter(t => t.allocated < t.max);
        if (availableTechs.length === 0) break; // Cannot fulfill total target with available questions

        const count = availableTechs.length;
        // Distribute in chunks to speed up but keep relatively even
        const chunk = Math.max(1, Math.floor(globalNeeded / count));
        
        let distributedInPass = 0;
        for (const tech of availableTechs) {
            if (globalNeeded <= 0) break;
            const space = tech.max - tech.allocated;
            // Use Math.ceil(globalNeeded/remainingTechs) logic? No, simplified chunk is fine for now.
            // If we have 10 needed, 3 techs. Chunk = 3.
            // Tech 1 takes 3. Tech 2 takes 3. Tech 3 takes 3. Left 1. 
            // Next pass chunk = 1. Tech 1 takes 1. Done.
            
            const toAdd = Math.min(chunk, space, globalNeeded); 
            
            if (toAdd > 0) {
                tech.allocated += toAdd;
                globalNeeded -= toAdd;
                distributedInPass += toAdd;
            }
        }
        
        if (distributedInPass === 0) break; 
    }

    // Now push allocations to categories
    techCapacities.forEach(tech => {
        const allocated = tech.allocated;
        if (allocated > 0) {
            const distribution = distributeToCategories(allocated, tech.limitObj);
            // Write to result
            Object.assign(result[tech.id][difficulty], distribution);
            result[tech.id][difficulty].total = allocated;
        }
    });
  });

  return result;
};

const distributeToCategories = (totalAllocated: number, limitObj: any): Record<string, number> => {
    let remaining = totalAllocated;
    const catAllocations: Record<string, number> = {};
    TARGET_CATEGORIES.forEach(cat => catAllocations[cat] = 0);
    
    while (remaining > 0) {
        const availableCats = TARGET_CATEGORIES.filter(cat => {
            const current = catAllocations[cat];
            const max = (typeof limitObj[cat] === 'number' ? limitObj[cat] : 0);
            return current < max;
        });
        
        if (availableCats.length === 0) break;

        const count = availableCats.length;
        const chunk = Math.max(1, Math.floor(remaining / count));
        
        let distributedInPass = 0;
        for (const cat of availableCats) {
             if (remaining <= 0) break;
             const max = (typeof limitObj[cat] === 'number' ? limitObj[cat] : 0);
             const space = max - catAllocations[cat];
             const toAdd = Math.min(chunk, space, remaining);
             
             if (toAdd > 0) {
                 catAllocations[cat] += toAdd;
                 remaining -= toAdd;
                 distributedInPass += toAdd;
             }
        }
        if (distributedInPass === 0) break;
    }
    
    return catAllocations;
};
