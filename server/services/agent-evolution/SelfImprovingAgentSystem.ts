/**
 * Self-Improving Agent Architectures - v1.2
 * 
 * Evolutionary algorithms and genetic programming for agents that
 * continuously improve their performance through natural selection.
 * 
 * @version 1.2.0
 * @module SelfImprovingAgentSystem
 */

import { EventEmitter } from 'events';

/**
 * Agent genome defining behavior and capabilities
 */
interface AgentGenome {
  id: string;
  generation: number;
  genes: {
    learningRate: number;        // 0-1
    explorationRate: number;      // 0-1
    adaptability: number;         // 0-1
    specialization: number;       // 0-1
    collaboration: number;        // 0-1
    riskTolerance: number;        // 0-1
    creativityFactor: number;     // 0-1
    efficiencyBias: number;       // 0-1
  };
  neuralArchitecture: {
    layers: number;
    neuronsPerLayer: number[];
    activationFunctions: string[];
    dropoutRates: number[];
  };
  fitness: number;                // Performance score
  age: number;                    // Generations survived
  parentIds: string[];            // Genetic lineage
}

/**
 * Evolution configuration
 */
interface EvolutionConfig {
  populationSize: number;
  elitePercentage: number;        // Top performers to preserve
  mutationRate: number;           // 0-1
  crossoverRate: number;          // 0-1
  generationLimit?: number;
  fitnessThreshold?: number;
  diversityWeight: number;        // Encourage genetic diversity
}

/**
 * Performance metrics for agent evaluation
 */
interface PerformanceMetrics {
  taskSuccessRate: number;
  averageQuality: number;
  averageSpeed: number;
  resourceEfficiency: number;
  collaborationScore: number;
  innovationScore: number;
  userSatisfaction: number;
  adaptabilityScore: number;
}

/**
 * Evolution result
 */
interface EvolutionResult {
  generation: number;
  bestAgent: AgentGenome;
  populationFitness: {
    best: number;
    average: number;
    worst: number;
    diversity: number;
  };
  improvements: {
    fitnessImprovement: number;
    convergenceRate: number;
    innovationsDiscovered: number;
  };
  mutations: number;
  crossovers: number;
}

/**
 * Self-Improving Agent System
 * 
 * Uses evolutionary algorithms to breed better performing agents
 * through selection, crossover, and mutation.
 */
export class SelfImprovingAgentSystem extends EventEmitter {
  private population: AgentGenome[] = [];
  private generation: number = 0;
  private evolutionHistory: EvolutionResult[] = [];
  private config: EvolutionConfig;

  constructor(config?: Partial<EvolutionConfig>) {
    super();
    
    this.config = {
      populationSize: config?.populationSize || 50,
      elitePercentage: config?.elitePercentage || 0.1,
      mutationRate: config?.mutationRate || 0.1,
      crossoverRate: config?.crossoverRate || 0.7,
      diversityWeight: config?.diversityWeight || 0.2,
    };
  }

  /**
   * Initialize population with random agents
   */
  async initializePopulation(): Promise<void> {
    this.population = [];
    
    for (let i = 0; i < this.config.populationSize; i++) {
      const agent = this.createRandomAgent();
      this.population.push(agent);
    }

    this.emit('population:initialized', {
      size: this.population.length,
      generation: this.generation,
    });
  }

  /**
   * Run one generation of evolution
   */
  async evolveGeneration(
    fitnessEvaluator: (agent: AgentGenome) => Promise<PerformanceMetrics>
  ): Promise<EvolutionResult> {
    this.generation++;
    
    this.emit('evolution:generation_started', {
      generation: this.generation,
      populationSize: this.population.length,
    });

    // Evaluate fitness for all agents
    await this.evaluateFitness(fitnessEvaluator);

    // Sort by fitness
    this.population.sort((a, b) => b.fitness - a.fitness);

    // Selection: Keep elite agents
    const eliteCount = Math.ceil(this.config.populationSize * this.config.elitePercentage);
    const elites = this.population.slice(0, eliteCount);

    // Generate offspring through crossover and mutation
    const offspring: AgentGenome[] = [];
    const mutations = { count: 0 };
    const crossovers = { count: 0 };

    while (offspring.length < this.config.populationSize - eliteCount) {
      if (Math.random() < this.config.crossoverRate) {
        // Crossover
        const parent1 = this.selectParent();
        const parent2 = this.selectParent();
        const child = this.crossover(parent1, parent2);
        crossovers.count++;
        offspring.push(child);
      }

      if (Math.random() < this.config.mutationRate && offspring.length > 0) {
        // Mutation
        const mutant = this.mutate(offspring[offspring.length - 1]);
        mutations.count++;
        offspring[offspring.length - 1] = mutant;
      }
    }

    // Create new population
    this.population = [...elites, ...offspring];

    // Calculate statistics
    const bestAgent = this.population[0];
    const avgFitness = this.population.reduce((sum, a) => sum + a.fitness, 0) / this.population.length;
    const worstFitness = this.population[this.population.length - 1].fitness;
    const diversity = this.calculateGeneticDiversity();

    const previousBest = this.evolutionHistory.length > 0
      ? this.evolutionHistory[this.evolutionHistory.length - 1].populationFitness.best
      : 0;

    const result: EvolutionResult = {
      generation: this.generation,
      bestAgent,
      populationFitness: {
        best: bestAgent.fitness,
        average: avgFitness,
        worst: worstFitness,
        diversity,
      },
      improvements: {
        fitnessImprovement: bestAgent.fitness - previousBest,
        convergenceRate: this.calculateConvergenceRate(),
        innovationsDiscovered: this.countInnovations(),
      },
      mutations: mutations.count,
      crossovers: crossovers.count,
    };

    this.evolutionHistory.push(result);
    
    this.emit('evolution:generation_completed', result);

    return result;
  }

  /**
   * Evaluate fitness for all agents
   */
  private async evaluateFitness(
    evaluator: (agent: AgentGenome) => Promise<PerformanceMetrics>
  ): Promise<void> {
    for (const agent of this.population) {
      const metrics = await evaluator(agent);
      agent.fitness = this.calculateFitness(metrics, agent);
      agent.age++;
    }
  }

  /**
   * Calculate fitness score from performance metrics
   */
  private calculateFitness(metrics: PerformanceMetrics, agent: AgentGenome): number {
    // Weighted combination of metrics
    let fitness = 
      metrics.taskSuccessRate * 0.25 +
      metrics.averageQuality * 0.20 +
      metrics.resourceEfficiency * 0.15 +
      metrics.collaborationScore * 0.15 +
      metrics.innovationScore * 0.10 +
      metrics.userSatisfaction * 0.10 +
      metrics.adaptabilityScore * 0.05;

    // Bonus for longevity (successful agents that survive)
    fitness += Math.min(0.1, agent.age * 0.01);

    // Penalty for overly complex architectures (encourage efficiency)
    const complexityPenalty = agent.neuralArchitecture.layers > 10 ? 0.05 : 0;
    fitness -= complexityPenalty;

    return Math.max(0, Math.min(1, fitness));
  }

  /**
   * Select parent using tournament selection
   */
  private selectParent(): AgentGenome {
    const tournamentSize = 5;
    const tournament: AgentGenome[] = [];

    for (let i = 0; i < tournamentSize; i++) {
      const randomIndex = Math.floor(Math.random() * this.population.length);
      tournament.push(this.population[randomIndex]);
    }

    // Return fittest from tournament
    return tournament.reduce((best, current) =>
      current.fitness > best.fitness ? current : best
    );
  }

  /**
   * Crossover: Combine genes from two parents
   */
  private crossover(parent1: AgentGenome, parent2: AgentGenome): AgentGenome {
    const child: AgentGenome = {
      id: this.generateId(),
      generation: this.generation,
      genes: {
        learningRate: this.blend(parent1.genes.learningRate, parent2.genes.learningRate),
        explorationRate: this.blend(parent1.genes.explorationRate, parent2.genes.explorationRate),
        adaptability: this.blend(parent1.genes.adaptability, parent2.genes.adaptability),
        specialization: this.blend(parent1.genes.specialization, parent2.genes.specialization),
        collaboration: this.blend(parent1.genes.collaboration, parent2.genes.collaboration),
        riskTolerance: this.blend(parent1.genes.riskTolerance, parent2.genes.riskTolerance),
        creativityFactor: this.blend(parent1.genes.creativityFactor, parent2.genes.creativityFactor),
        efficiencyBias: this.blend(parent1.genes.efficiencyBias, parent2.genes.efficiencyBias),
      },
      neuralArchitecture: this.crossoverArchitecture(
        parent1.neuralArchitecture,
        parent2.neuralArchitecture
      ),
      fitness: 0,
      age: 0,
      parentIds: [parent1.id, parent2.id],
    };

    return child;
  }

  /**
   * Blend two gene values with some randomness
   */
  private blend(gene1: number, gene2: number): number {
    const alpha = Math.random();
    return Math.max(0, Math.min(1, gene1 * alpha + gene2 * (1 - alpha)));
  }

  /**
   * Crossover neural architectures
   */
  private crossoverArchitecture(arch1: AgentGenome['neuralArchitecture'], arch2: AgentGenome['neuralArchitecture']): AgentGenome['neuralArchitecture'] {
    // Use one parent's architecture as base, modify with other's traits
    const baseArch = Math.random() < 0.5 ? arch1 : arch2;
    const otherArch = baseArch === arch1 ? arch2 : arch1;

    return {
      layers: Math.floor((baseArch.layers + otherArch.layers) / 2),
      neuronsPerLayer: baseArch.neuronsPerLayer.map((neurons, i) =>
        Math.floor((neurons + (otherArch.neuronsPerLayer[i] || neurons)) / 2)
      ),
      activationFunctions: baseArch.activationFunctions,
      dropoutRates: baseArch.dropoutRates.map((rate, i) =>
        (rate + (otherArch.dropoutRates[i] || rate)) / 2
      ),
    };
  }

  /**
   * Mutate: Randomly modify genes
   */
  private mutate(agent: AgentGenome): AgentGenome {
    const mutant = JSON.parse(JSON.stringify(agent)) as AgentGenome;
    mutant.id = this.generateId();

    // Gene mutations (small random changes)
    const mutationStrength = 0.1;
    
    for (const gene in mutant.genes) {
      if (Math.random() < 0.3) { // 30% chance per gene
        const change = (Math.random() - 0.5) * mutationStrength;
        (mutant.genes as any)[gene] = Math.max(0, Math.min(1, (mutant.genes as any)[gene] + change));
      }
    }

    // Architectural mutations
    if (Math.random() < 0.1) { // 10% chance
      mutant.neuralArchitecture = this.mutateArchitecture(mutant.neuralArchitecture);
    }

    return mutant;
  }

  /**
   * Mutate neural architecture
   */
  private mutateArchitecture(arch: AgentGenome['neuralArchitecture']): AgentGenome['neuralArchitecture'] {
    const mutatedArch = JSON.parse(JSON.stringify(arch));

    // Add or remove layer
    if (Math.random() < 0.3) {
      if (Math.random() < 0.5 && mutatedArch.layers < 15) {
        mutatedArch.layers++;
        mutatedArch.neuronsPerLayer.push(64);
        mutatedArch.activationFunctions.push('relu');
        mutatedArch.dropoutRates.push(0.2);
      } else if (mutatedArch.layers > 2) {
        mutatedArch.layers--;
        mutatedArch.neuronsPerLayer.pop();
        mutatedArch.activationFunctions.pop();
        mutatedArch.dropoutRates.pop();
      }
    }

    // Modify neurons in layer
    if (Math.random() < 0.3) {
      const layerIndex = Math.floor(Math.random() * mutatedArch.neuronsPerLayer.length);
      const change = Math.floor((Math.random() - 0.5) * 32);
      mutatedArch.neuronsPerLayer[layerIndex] = Math.max(8, Math.min(256, mutatedArch.neuronsPerLayer[layerIndex] + change));
    }

    return mutatedArch;
  }

  /**
   * Create random agent
   */
  private createRandomAgent(): AgentGenome {
    const layers = Math.floor(Math.random() * 8) + 3; // 3-10 layers

    return {
      id: this.generateId(),
      generation: 0,
      genes: {
        learningRate: Math.random(),
        explorationRate: Math.random(),
        adaptability: Math.random(),
        specialization: Math.random(),
        collaboration: Math.random(),
        riskTolerance: Math.random(),
        creativityFactor: Math.random(),
        efficiencyBias: Math.random(),
      },
      neuralArchitecture: {
        layers,
        neuronsPerLayer: Array(layers).fill(0).map(() => 
          Math.floor(Math.random() * 128) + 32 // 32-160 neurons
        ),
        activationFunctions: Array(layers).fill('relu'),
        dropoutRates: Array(layers).fill(0).map(() => Math.random() * 0.3),
      },
      fitness: 0,
      age: 0,
      parentIds: [],
    };
  }

  /**
   * Calculate genetic diversity in population
   */
  private calculateGeneticDiversity(): number {
    if (this.population.length < 2) return 0;

    let totalDiversity = 0;
    let comparisons = 0;

    for (let i = 0; i < this.population.length; i++) {
      for (let j = i + 1; j < this.population.length; j++) {
        totalDiversity += this.calculateGeneticDistance(
          this.population[i],
          this.population[j]
        );
        comparisons++;
      }
    }

    return comparisons > 0 ? totalDiversity / comparisons : 0;
  }

  /**
   * Calculate genetic distance between two agents
   */
  private calculateGeneticDistance(agent1: AgentGenome, agent2: AgentGenome): number {
    let distance = 0;
    let geneCount = 0;

    // Compare genes
    for (const gene in agent1.genes) {
      distance += Math.abs((agent1.genes as any)[gene] - (agent2.genes as any)[gene]);
      geneCount++;
    }

    // Compare architecture
    distance += Math.abs(agent1.neuralArchitecture.layers - agent2.neuralArchitecture.layers) / 10;

    return distance / (geneCount + 1);
  }

  /**
   * Calculate convergence rate
   */
  private calculateConvergenceRate(): number {
    if (this.evolutionHistory.length < 2) return 0;

    const recent = this.evolutionHistory.slice(-5);
    const fitnessChanges = recent.slice(1).map((result, i) =>
      result.populationFitness.best - recent[i].populationFitness.best
    );

    const avgChange = fitnessChanges.reduce((sum, change) => sum + change, 0) / fitnessChanges.length;
    
    return Math.max(0, avgChange);
  }

  /**
   * Count innovations discovered
   */
  private countInnovations(): number {
    // Innovations are novel gene combinations or architectures
    // Simplified: count agents with above-average fitness and high diversity
    return this.population.filter(agent => {
      const avgFitness = this.population.reduce((sum, a) => sum + a.fitness, 0) / this.population.length;
      return agent.fitness > avgFitness && agent.age === 0; // New and good
    }).length;
  }

  /**
   * Get best performing agent
   */
  getBestAgent(): AgentGenome | null {
    if (this.population.length === 0) return null;
    return this.population.reduce((best, current) =>
      current.fitness > best.fitness ? current : best
    );
  }

  /**
   * Get evolution statistics
   */
  getStatistics() {
    const bestAgent = this.getBestAgent();

    return {
      generation: this.generation,
      populationSize: this.population.length,
      bestFitness: bestAgent?.fitness || 0,
      averageFitness: this.population.reduce((sum, a) => sum + a.fitness, 0) / Math.max(1, this.population.length),
      geneticDiversity: this.calculateGeneticDiversity(),
      evolutionHistory: this.evolutionHistory,
      config: this.config,
    };
  }

  /**
   * Export agent genome for deployment
   */
  exportAgent(agentId: string): AgentGenome | null {
    return this.population.find(a => a.id === agentId) || null;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Reset evolution
   */
  reset(): void {
    this.population = [];
    this.generation = 0;
    this.evolutionHistory = [];
    this.emit('evolution:reset');
  }
}

/**
 * Singleton instance
 */
export const selfImprovingAgentSystem = new SelfImprovingAgentSystem();
