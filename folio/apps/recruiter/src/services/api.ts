/**
 * RecruiterOS Service Layer Adapter
 * Establish clean interfaces and mock pipelines to integrate with downstream microservice APIs:
 * - AI Matchmaking Engine
 * - Portfolio Intelligence Evaluator
 * - Outbound Communication Integrations
 */

export interface MatchScoreResponse {
  matchScore: number;
  jobId: string;
  candidateId: string;
  competencyBreakdown: Record<string, number>;
  recommendationRating: 'High' | 'Medium' | 'Low';
  aiDecisionBadge: boolean;
}

export interface JDQualityResponse {
  rating: 'Good' | 'Average' | 'Bad';
  score: number; // 0 - 100
  suggestions: string[];
  mismatchFound: boolean;
  conflictingKeywords: string[];
}

export class MatchingEngineService {
  /**
   * Fetch matching score for a candidate against a particular job requisition
   */
  static async fetchMatchScore(jobId: string, candidateId: string): Promise<MatchScoreResponse> {
    // Fetch candidate from the unified API
    let score = 50;
    try {
      const res = await fetch(`http://localhost:8000/api/collections/candidates`);
      const candidates = await res.json();
      const candidate = candidates.find((c: any) => c.id === candidateId);
      if (candidate) {
        // Calculate deterministic score based on skills overlap and experience
        score = candidate.matchScore || 75; // Use pre-calculated or default
        if (candidate.skills && candidate.skills.length > 2) score += 10;
        if (candidate.experience > 2) score += 10;
      }
    } catch (e) {
      score = Math.floor(Math.random() * 30) + 70;
    }
    
    const calculatedScore = Math.min(100, score);
    
    return {
      matchScore: calculatedScore,
      jobId,
      candidateId,
      competencyBreakdown: {
        Creativity: Math.max(60, calculatedScore - 10),
        Leadership: Math.max(60, calculatedScore - 15),
        Teamwork: Math.max(60, calculatedScore - 5),
        Communication: Math.max(60, calculatedScore - 8),
        'Problem Solving': Math.max(60, calculatedScore - 2),
      },
      recommendationRating: calculatedScore >= 85 ? 'High' : 'Medium',
      aiDecisionBadge: calculatedScore >= 85,
    };
  }

  /**
   * Submit JD and required skills for a real-time quality evaluation
   */
  static async evaluateJDQuality(description: string, skills: string[]): Promise<JDQualityResponse> {
    await new Promise((resolve) => setTimeout(resolve, 250));

    const suggestions: string[] = [];
    let score = 30;

    if (description.length > 150) score += 30;
    else if (description.length > 50) {
      score += 15;
      suggestions.push("Lengthen the description to fully elaborate tasks and expectations.");
    } else {
      suggestions.push("The description length is insufficient for AI matching (minimum 150 characters recommended).");
    }

    if (skills.length >= 3) score += 20;
    else if (skills.length > 0) {
      score += 10;
      suggestions.push("Specify at least 3 required skills tags to optimize indexing accuracy.");
    } else {
      suggestions.push("No candidate validation skills have been tag-indexed.");
    }

    // Keyword density check
    const industryKeyWords = ["react", "typescript", "design", "figma", "sql", "analytics", "sales", "cloud"];
    const matches = industryKeyWords.filter(kw => description.toLowerCase().includes(kw));
    if (matches.length >= 2) score += 20;
    else {
      suggestions.push("Enrich language with industry terms (e.g. cloud, framework names, methodology).");
    }

    let rating: JDQualityResponse['rating'] = 'Bad';
    if (score >= 80) rating = 'Good';
    else if (score >= 50) rating = 'Average';

    return {
      rating,
      score,
      suggestions,
      mismatchFound: rating === 'Bad',
      conflictingKeywords: rating === 'Bad' ? ['Generic Template'] : [],
    };
  }
}
