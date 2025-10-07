/**
 * Paradox-Based Conflict Resolution for Multi-Agent System
 * 
 * Integrates ParadoxResolver to provide scientifically-grounded
 * conflict resolution for multi-agent code collaboration.
 */

import { ParadoxResolverClient, createParadoxResolverClient } from '../../../../ParadoxResolver/client/ParadoxResolverClient';
import { AgentType } from './baseAgent';

export interface AgentConflict {
  conflictId: string;
  agents: AgentType[];
  conflictType: 'code' | 'architecture' | 'priority' | 'resource' | 'strategy';
  description: string;
  proposals: ParadoxConflictProposal[];
  context?: Record<string, any>;
  timestamp: Date;
}

export interface ParadoxConflictProposal {
  agent: AgentType;
  proposal: any;
  reasoning: string;
  confidence: number;
  weight?: number;
}

export interface ParadoxResolution {
  resolvedState: any;
  strategy: 'convergent' | 'meta_phase' | 'evolutionary';
  confidence: number;
  iterations: number;
  reasoning: string;
  contributions: Record<AgentType, number>; // How much each agent contributed
  timestamp: Date;
}

export interface ResourceAllocationRequest {
  resources: Array<{ name: string; total: number }>;
  agents: Array<{
    agent: AgentType;
    influence: number;
    preferences: Record<string, number>;
  }>;
}

export interface ResourceAllocationResult {
  allocation: Record<AgentType, Record<string, number>>;
  satisfaction: Record<AgentType, number>;
  fairness: number;
  totalSatisfaction: number;
}

export class ParadoxConflictResolver {
  private client: ParadoxResolverClient;
  private conflictHistory: Map<string, ParadoxResolution> = new Map();
  
  constructor(serviceUrl?: string) {
    this.client = createParadoxResolverClient({ 
      serviceUrl: serviceUrl || 'http://localhost:3333',
      timeout: 30000
    });
  }

  /**
   * Resolve agent conflict using appropriate paradox resolution strategy
   */
  async resolveConflict(conflict: AgentConflict): Promise<ParadoxResolution> {
    try {
      // Select strategy based on conflict type
      const strategy = this.selectResolutionStrategy(conflict);
      
      let resolution: ParadoxResolution;
      
      switch (strategy) {
        case 'convergent':
          resolution = await this.resolveWithConvergence(conflict);
          break;
        
        case 'meta_phase':
          resolution = await this.resolveWithMetaPhases(conflict);
          break;
        
        case 'evolutionary':
          resolution = await this.resolveWithEvolution(conflict);
          break;
        
        default:
          throw new Error(`Unknown strategy: ${strategy}`);
      }
      
      // Store resolution in history
      this.conflictHistory.set(conflict.conflictId, resolution);
      
      return resolution;
      
    } catch (error) {
      console.error('Paradox conflict resolution failed:', error);
      
      // Fallback to simple resolution
      return this.fallbackResolution(conflict);
    }
  }

  /**
   * Resolve using standard convergent transformation rules
   */
  private async resolveWithConvergence(conflict: AgentConflict): Promise<ParadoxResolution> {
    // Convert proposals to a numerical/matrix state for paradox resolution
    const initialState = this.proposalsToState(conflict.proposals);
    
    const result = await this.client.resolve({
      initial_state: initialState,
      input_type: 'numerical',
      max_iterations: 30,
      convergence_threshold: 0.001,
      rules: [
        'fixed_point_iteration',
        'recursive_normalization',
        'bayesian_update'
      ]
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Resolution failed');
    }
    
    // Convert resolved state back to meaningful solution
    const resolvedState = this.stateToProposal(result.final_state, conflict);
    
    // Calculate agent contributions
    const contributions = this.calculateContributions(
      conflict.proposals,
      result.final_state,
      initialState
    );
    
    return {
      resolvedState,
      strategy: 'convergent',
      confidence: result.converged ? 0.9 : 0.7,
      iterations: result.iterations,
      reasoning: `Resolved through ${result.iterations} iterations of convergent transformation. State reached ${result.converged ? 'equilibrium' : 'near-equilibrium'}.`,
      contributions,
      timestamp: new Date()
    };
  }

  /**
   * Resolve using meta-framework with phase transitions
   */
  private async resolveWithMetaPhases(conflict: AgentConflict): Promise<ParadoxResolution> {
    const initialState = this.proposalsToState(conflict.proposals);
    
    const result = await this.client.metaResolve({
      initial_state: initialState,
      input_type: 'numerical',
      max_phase_transitions: 5,
      max_total_iterations: 50
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Meta-resolution failed');
    }
    
    const resolvedState = this.stateToProposal(result.final_state, conflict);
    const contributions = this.calculateContributions(
      conflict.proposals,
      result.final_state,
      initialState
    );
    
    // Generate detailed reasoning about phase transitions
    const phaseDescription = result.phase_history.join(' → ');
    
    return {
      resolvedState,
      strategy: 'meta_phase',
      confidence: result.converged ? 0.95 : 0.75,
      iterations: result.total_iterations,
      reasoning: `Resolved through ${result.phase_transitions} phase transitions (${phaseDescription}). Meta-framework explored convergent and divergent approaches across ${result.total_iterations} total iterations.`,
      contributions,
      timestamp: new Date()
    };
  }

  /**
   * Resolve using evolutionary rule discovery
   */
  private async resolveWithEvolution(conflict: AgentConflict): Promise<ParadoxResolution> {
    // Generate test cases from proposal variations
    const testCases = conflict.proposals.map(p => this.proposalToTestCase(p));
    
    const result = await this.client.evolve({
      test_cases: testCases,
      generations: 15,
      population_size: 20,
      mutation_rate: 0.3
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Evolution failed');
    }
    
    // Use best evolved rule to resolve the conflict
    // For now, use weighted average based on evolved fitness
    const resolvedState = this.evolutionaryResolve(conflict.proposals, result);
    
    const contributions = this.equalContributions(conflict.proposals);
    
    return {
      resolvedState,
      strategy: 'evolutionary',
      confidence: result.best_fitness,
      iterations: result.generations * result.population_size,
      reasoning: `Evolved ${result.best_rules.length} novel transformation rules over ${result.generations} generations. Best fitness: ${result.best_fitness.toFixed(3)}.`,
      contributions,
      timestamp: new Date()
    };
  }

  /**
   * Optimize resource allocation among competing agents
   */
  async allocateResources(request: ResourceAllocationRequest): Promise<ResourceAllocationResult> {
    try {
      // Transform to ParadoxResolver format
      const stakeholders = request.agents.map(a => ({
        name: a.agent,
        influence: a.influence,
        preferences: a.preferences
      }));
      
      const result = await this.client.optimize({
        resources: request.resources,
        stakeholders
      });
      
      if (!result.success) {
        throw new Error(result.error || 'Optimization failed');
      }
      
      // Transform back to agent-centric format
      const allocation: Record<AgentType, Record<string, number>> = {};
      const satisfaction: Record<AgentType, number> = {};
      
      for (const [stakeholderName, resources] of Object.entries(result.allocation)) {
        allocation[stakeholderName as AgentType] = resources;
      }
      
      for (const [stakeholderName, score] of Object.entries(result.stakeholder_satisfaction)) {
        satisfaction[stakeholderName as AgentType] = score;
      }
      
      return {
        allocation,
        satisfaction,
        fairness: result.fairness_score,
        totalSatisfaction: result.total_satisfaction
      };
      
    } catch (error) {
      console.error('Resource allocation failed:', error);
      throw error;
    }
  }

  /**
   * Select appropriate resolution strategy based on conflict characteristics
   */
  private selectResolutionStrategy(conflict: AgentConflict): 'convergent' | 'meta_phase' | 'evolutionary' {
    // Simple heuristics - can be enhanced with ML
    
    // Use evolutionary for novel/creative conflicts
    if (conflict.conflictType === 'strategy' || conflict.proposals.length > 3) {
      return 'evolutionary';
    }
    
    // Use meta-phase for complex architectural conflicts
    if (conflict.conflictType === 'architecture' || conflict.agents.length > 2) {
      return 'meta_phase';
    }
    
    // Use convergent for straightforward conflicts
    return 'convergent';
  }

  /**
   * Convert agent proposals to paradox-resolvable state
   */
  private proposalsToState(proposals: ParadoxConflictProposal[]): number[] {
    // Normalize proposals to numerical vector
    // Each proposal becomes a weighted value based on confidence
    return proposals.map(p => p.confidence * (p.weight || 1.0));
  }

  /**
   * Convert resolved state back to meaningful proposal
   */
  private stateToProposal(state: any, conflict: AgentConflict): any {
    // Interpret the resolved state as weights for combining proposals
    const weights = Array.isArray(state) ? state : [state];
    
    // Normalize weights
    const total = weights.reduce((sum, w) => sum + Math.abs(w), 0);
    const normalizedWeights = weights.map(w => Math.abs(w) / total);
    
    // Combine proposals based on weights
    const combined: any = {};
    
    conflict.proposals.forEach((proposal, i) => {
      const weight = normalizedWeights[i] || 0;
      
      // Merge proposal into combined result
      if (typeof proposal.proposal === 'object') {
        for (const [key, value] of Object.entries(proposal.proposal)) {
          if (!combined[key]) combined[key] = 0;
          if (typeof value === 'number') {
            combined[key] += value * weight;
          }
        }
      }
    });
    
    return {
      combined,
      weights: normalizedWeights,
      dominantAgent: conflict.proposals[normalizedWeights.indexOf(Math.max(...normalizedWeights))].agent
    };
  }

  /**
   * Convert proposal to test case for evolution
   */
  private proposalToTestCase(proposal: ParadoxConflictProposal): any {
    return proposal.confidence;
  }

  /**
   * Resolve using evolutionary results
   */
  private evolutionaryResolve(proposals: ParadoxConflictProposal[], evolutionResult: any): any {
    // Use weighted average based on proposal confidence
    const weights = proposals.map(p => p.confidence);
    const total = weights.reduce((sum, w) => sum + w, 0);
    
    return {
      proposals: proposals.map((p, i) => ({
        agent: p.agent,
        weight: weights[i] / total
      })),
      dominantAgent: proposals[weights.indexOf(Math.max(...weights))].agent
    };
  }

  /**
   * Calculate how much each agent contributed to final resolution
   */
  private calculateContributions(
    proposals: ParadoxConflictProposal[],
    finalState: any,
    initialState: any
  ): Record<AgentType, number> {
    const contributions: Record<string, number> = {};
    
    // Simple attribution based on proximity to final state
    const finalWeights = Array.isArray(finalState) ? finalState : [finalState];
    const total = finalWeights.reduce((sum, w) => sum + Math.abs(w), 0);
    
    proposals.forEach((proposal, i) => {
      const contribution = Math.abs(finalWeights[i] || 0) / total;
      contributions[proposal.agent] = contribution;
    });
    
    return contributions as Record<AgentType, number>;
  }

  /**
   * Equal contributions (fallback)
   */
  private equalContributions(proposals: ParadoxConflictProposal[]): Record<AgentType, number> {
    const contributions: Record<string, number> = {};
    const equal = 1.0 / proposals.length;
    
    proposals.forEach(proposal => {
      contributions[proposal.agent] = equal;
    });
    
    return contributions as Record<AgentType, number>;
  }

  /**
   * Fallback resolution when paradox resolver fails
   */
  private fallbackResolution(conflict: AgentConflict): ParadoxResolution {
    // Select proposal with highest confidence
    const bestProposal = conflict.proposals.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    );
    
    const contributions: Record<string, number> = {};
    conflict.proposals.forEach(p => {
      contributions[p.agent] = p.agent === bestProposal.agent ? 1.0 : 0.0;
    });
    
    return {
      resolvedState: bestProposal.proposal,
      strategy: 'convergent',
      confidence: bestProposal.confidence,
      iterations: 0,
      reasoning: 'Fallback: Selected highest confidence proposal',
      contributions: contributions as Record<AgentType, number>,
      timestamp: new Date()
    };
  }

  /**
   * Get conflict resolution history
   */
  getResolutionHistory(): Map<string, ParadoxResolution> {
    return this.conflictHistory;
  }

  /**
   * Get statistics about resolution effectiveness
   */
  getResolutionStats(): {
    totalConflicts: number;
    averageConfidence: number;
    averageIterations: number;
    strategyDistribution: Record<string, number>;
  } {
    const resolutions = Array.from(this.conflictHistory.values());
    
    if (resolutions.length === 0) {
      return {
        totalConflicts: 0,
        averageConfidence: 0,
        averageIterations: 0,
        strategyDistribution: {}
      };
    }
    
    const strategyDist: Record<string, number> = {};
    resolutions.forEach(r => {
      strategyDist[r.strategy] = (strategyDist[r.strategy] || 0) + 1;
    });
    
    return {
      totalConflicts: resolutions.length,
      averageConfidence: resolutions.reduce((sum, r) => sum + r.confidence, 0) / resolutions.length,
      averageIterations: resolutions.reduce((sum, r) => sum + r.iterations, 0) / resolutions.length,
      strategyDistribution: strategyDist
    };
  }

  /**
   * Check if ParadoxResolver service is available
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      await this.client.healthCheck();
      return true;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const paradoxConflictResolver = new ParadoxConflictResolver();
