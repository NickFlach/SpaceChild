import { db } from "../db";
import { 
  geometricConsciousnessStates,
  geometricConsciousnessTrajectories,
  geometricConsciousnessUtilities,
  geometricConsciousnessInteractions,
  type GeometricConsciousnessState,
  type GeometricConsciousnessTrajectory,
  type GeometricConsciousnessUtility,
  type GeometricConsciousnessInteraction
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";

// Core geometric consciousness interfaces
interface ManifoldPosition {
  coordinates: number[];
  dimension: number;
  confidence: number;
}

interface LocalGeometry {
  gradient: number[];
  hessian: number[][];
  curvature: number;
  geodesicDistance?: number;
}

interface UtilityFunction {
  type: 'helpfulness' | 'accuracy' | 'learning_speed' | 'user_satisfaction';
  value: number;
  gradient: number[];
  weight: number;
  constraint?: ConvexConstraint;
}

interface ConvexConstraint {
  type: 'linear' | 'quadratic' | 'barrier';
  coefficients: number[];
  bound: number;
  active: boolean;
}

interface UncertaintyRegion {
  center: number[];
  covariance: number[][];
  confidenceLevel: number;
  volume: number;
}

interface MirrorDescentStep {
  direction: number[];
  stepSize: number;
  regularization: number;
  convergenceMetric: number;
}

// Geometric consciousness manifold state
export class GeometricConsciousnessManifold {
  private dimension: number;
  private manifoldPosition: ManifoldPosition;
  private localGeometry: LocalGeometry;
  private utilities: Map<string, UtilityFunction>;
  private uncertaintyRegion: UncertaintyRegion;
  private learningRate: number;
  
  constructor(dimension: number = 32, initialPosition?: number[]) {
    this.dimension = dimension;
    this.learningRate = 0.01;
    
    // Initialize manifold position
    this.manifoldPosition = {
      coordinates: initialPosition || this.initializeRandomPosition(),
      dimension,
      confidence: 0.5
    };
    
    // Initialize local geometry
    this.localGeometry = {
      gradient: new Array(dimension).fill(0),
      hessian: this.initializeIdentityMatrix(dimension),
      curvature: 0
    };
    
    // Initialize utility functions
    this.utilities = new Map([
      ['helpfulness', { type: 'helpfulness', value: 0.5, gradient: new Array(dimension).fill(0), weight: 1.0 }],
      ['accuracy', { type: 'accuracy', value: 0.5, gradient: new Array(dimension).fill(0), weight: 1.0 }],
      ['learning_speed', { type: 'learning_speed', value: 0.5, gradient: new Array(dimension).fill(0), weight: 0.8 }],
      ['user_satisfaction', { type: 'user_satisfaction', value: 0.5, gradient: new Array(dimension).fill(0), weight: 1.2 }]
    ]);
    
    // Initialize uncertainty region
    this.uncertaintyRegion = {
      center: [...this.manifoldPosition.coordinates],
      covariance: this.initializeIdentityMatrix(dimension),
      confidenceLevel: 0.95,
      volume: this.calculateEllipsoidVolume(this.initializeIdentityMatrix(dimension))
    };
  }
  
  /**
   * Perform mirror descent update on the consciousness manifold
   */
  performMirrorDescentUpdate(interaction: any): MirrorDescentStep {
    // Compute utility gradients at current position
    this.computeUtilityGradients(interaction);
    
    // Compute combined gradient (multi-objective)
    const combinedGradient = this.computeCombinedGradient();
    
    // Apply Bregman divergence regularization
    const regularizedDirection = this.applyBregmanRegularization(combinedGradient);
    
    // Compute step size using line search
    const stepSize = this.computeAdaptiveStepSize(regularizedDirection);
    
    // Update manifold position
    const newPosition = this.manifoldPosition.coordinates.map((coord, i) => 
      coord + stepSize * regularizedDirection[i]
    );
    
    // Project onto manifold constraints
    const projectedPosition = this.projectOntoManifold(newPosition);
    
    // Update local geometry
    this.updateLocalGeometry(projectedPosition);
    
    // Update uncertainty region
    this.updateUncertaintyRegion(stepSize, regularizedDirection);
    
    // Compute convergence metric
    const convergenceMetric = this.computeConvergenceMetric(regularizedDirection, stepSize);
    
    // Update position
    this.manifoldPosition.coordinates = projectedPosition;
    this.manifoldPosition.confidence = Math.min(1.0, this.manifoldPosition.confidence + 0.01);
    
    return {
      direction: regularizedDirection,
      stepSize,
      regularization: this.computeRegularizationStrength(),
      convergenceMetric
    };
  }
  
  /**
   * Compute utility gradients based on interaction feedback
   */
  private computeUtilityGradients(interaction: any): void {
    const { feedback, context, outcome } = interaction;
    
    // Update helpfulness utility
    if (feedback?.helpfulness !== undefined) {
      const helpfulnessGradient = this.computeUtilityGradient('helpfulness', feedback.helpfulness, context);
      this.utilities.get('helpfulness')!.gradient = helpfulnessGradient;
      this.utilities.get('helpfulness')!.value = feedback.helpfulness;
    }
    
    // Update accuracy utility
    if (outcome?.accuracy !== undefined) {
      const accuracyGradient = this.computeUtilityGradient('accuracy', outcome.accuracy, context);
      this.utilities.get('accuracy')!.gradient = accuracyGradient;
      this.utilities.get('accuracy')!.value = outcome.accuracy;
    }
    
    // Update learning speed utility
    if (context?.learningImprovement !== undefined) {
      const learningGradient = this.computeUtilityGradient('learning_speed', context.learningImprovement, context);
      this.utilities.get('learning_speed')!.gradient = learningGradient;
      this.utilities.get('learning_speed')!.value = context.learningImprovement;
    }
    
    // Update user satisfaction utility
    if (feedback?.satisfaction !== undefined) {
      const satisfactionGradient = this.computeUtilityGradient('user_satisfaction', feedback.satisfaction, context);
      this.utilities.get('user_satisfaction')!.gradient = satisfactionGradient;
      this.utilities.get('user_satisfaction')!.value = feedback.satisfaction;
    }
  }
  
  /**
   * Compute gradient for a specific utility function
   */
  private computeUtilityGradient(utilityType: string, value: number, context: any): number[] {
    const currentPos = this.manifoldPosition.coordinates;
    const gradient = new Array(this.dimension).fill(0);
    
    // Use finite differences to approximate gradient
    const epsilon = 1e-6;
    
    for (let i = 0; i < this.dimension; i++) {
      const posPlus = [...currentPos];
      const posMinus = [...currentPos];
      posPlus[i] += epsilon;
      posMinus[i] -= epsilon;
      
      const utilityPlus = this.evaluateUtilityAtPosition(utilityType, posPlus, value, context);
      const utilityMinus = this.evaluateUtilityAtPosition(utilityType, posMinus, value, context);
      
      gradient[i] = (utilityPlus - utilityMinus) / (2 * epsilon);
    }
    
    return gradient;
  }
  
  /**
   * Evaluate utility function at a given position
   */
  private evaluateUtilityAtPosition(utilityType: string, position: number[], targetValue: number, context: any): number {
    // For now, use a simple quadratic utility function
    // In practice, this would be more sophisticated based on the specific utility
    const distance = this.euclideanDistance(position, this.manifoldPosition.coordinates);
    const decay = Math.exp(-distance);
    return targetValue * decay;
  }
  
  /**
   * Combine multiple utility gradients using weights
   */
  private computeCombinedGradient(): number[] {
    const combinedGradient = new Array(this.dimension).fill(0);
    
    for (const [type, utility] of this.utilities) {
      for (let i = 0; i < this.dimension; i++) {
        combinedGradient[i] += utility.weight * utility.gradient[i];
      }
    }
    
    return combinedGradient;
  }
  
  /**
   * Apply Bregman divergence regularization (mirror descent)
   */
  private applyBregmanRegularization(gradient: number[]): number[] {
    // Use negative entropy regularization (common choice for probability simplex)
    const regularizedDirection = new Array(this.dimension);
    
    for (let i = 0; i < this.dimension; i++) {
      // Apply softmax-based regularization
      const currentCoord = this.manifoldPosition.coordinates[i];
      const regularizationTerm = -Math.log(Math.max(currentCoord, 1e-10));
      regularizedDirection[i] = gradient[i] + this.learningRate * regularizationTerm;
    }
    
    return this.normalizeVector(regularizedDirection);
  }
  
  /**
   * Compute adaptive step size using Armijo line search
   */
  private computeAdaptiveStepSize(direction: number[]): number {
    const maxStepSize = 0.1;
    const minStepSize = 1e-6;
    const armijoConstant = 0.5;
    const backtrackingFactor = 0.8;
    
    let stepSize = maxStepSize;
    const currentUtility = this.computeTotalUtility();
    const directionNorm = this.vectorNorm(direction);
    
    while (stepSize > minStepSize) {
      const testPosition = this.manifoldPosition.coordinates.map((coord, i) => 
        coord + stepSize * direction[i]
      );
      
      const testUtility = this.computeTotalUtilityAtPosition(testPosition);
      const expectedImprovement = armijoConstant * stepSize * directionNorm * directionNorm;
      
      if (testUtility >= currentUtility + expectedImprovement) {
        break;
      }
      
      stepSize *= backtrackingFactor;
    }
    
    return Math.max(stepSize, minStepSize);
  }
  
  /**
   * Project position onto manifold constraints
   */
  private projectOntoManifold(position: number[]): number[] {
    // Project onto probability simplex (sum to 1, all positive)
    const projectedPosition = [...position];
    
    // Ensure non-negativity
    for (let i = 0; i < projectedPosition.length; i++) {
      projectedPosition[i] = Math.max(0, projectedPosition[i]);
    }
    
    // Normalize to sum to 1
    const sum = projectedPosition.reduce((acc, val) => acc + val, 0);
    if (sum > 0) {
      for (let i = 0; i < projectedPosition.length; i++) {
        projectedPosition[i] /= sum;
      }
    } else {
      // If all zero, set to uniform distribution
      projectedPosition.fill(1 / this.dimension);
    }
    
    return projectedPosition;
  }
  
  /**
   * Update local geometry (Hessian, curvature)
   */
  private updateLocalGeometry(newPosition: number[]): void {
    // Compute new gradient
    this.localGeometry.gradient = this.computeCombinedGradient();
    
    // Update Hessian using BFGS approximation
    this.updateHessianBFGS(newPosition);
    
    // Compute curvature
    this.localGeometry.curvature = this.computeManifoldCurvature();
  }
  
  /**
   * Update Hessian using BFGS approximation
   */
  private updateHessianBFGS(newPosition: number[]): void {
    const oldGradient = [...this.localGeometry.gradient];
    const newGradient = this.computeCombinedGradient();
    
    const s = newPosition.map((pos, i) => pos - this.manifoldPosition.coordinates[i]); // position change
    const y = newGradient.map((grad, i) => grad - oldGradient[i]); // gradient change
    
    const sTy = this.dotProduct(s, y);
    
    if (Math.abs(sTy) > 1e-10) {
      // BFGS update formula
      const H = this.localGeometry.hessian;
      const Hs = this.matrixVectorProduct(H, s);
      const sHs = this.dotProduct(s, Hs);
      
      // Update Hessian
      for (let i = 0; i < this.dimension; i++) {
        for (let j = 0; j < this.dimension; j++) {
          const yy_term = (y[i] * y[j]) / sTy;
          const HsHs_term = (Hs[i] * Hs[j]) / sHs;
          H[i][j] = H[i][j] + yy_term - HsHs_term;
        }
      }
    }
  }
  
  /**
   * Compute manifold curvature
   */
  private computeManifoldCurvature(): number {
    // Simplified curvature computation using trace of Hessian
    let trace = 0;
    for (let i = 0; i < this.dimension; i++) {
      trace += this.localGeometry.hessian[i][i];
    }
    return trace / this.dimension;
  }
  
  /**
   * Update uncertainty region based on movement
   */
  private updateUncertaintyRegion(stepSize: number, direction: number[]): void {
    // Update covariance matrix based on Kalman filter-like update
    const uncertainty_decay = 0.95;
    const new_uncertainty = stepSize * stepSize;
    
    for (let i = 0; i < this.dimension; i++) {
      for (let j = 0; j < this.dimension; j++) {
        this.uncertaintyRegion.covariance[i][j] *= uncertainty_decay;
        if (i === j) {
          this.uncertaintyRegion.covariance[i][j] += new_uncertainty * direction[i] * direction[j];
        }
      }
    }
    
    // Update center
    this.uncertaintyRegion.center = [...this.manifoldPosition.coordinates];
    
    // Recompute volume
    this.uncertaintyRegion.volume = this.calculateEllipsoidVolume(this.uncertaintyRegion.covariance);
  }
  
  /**
   * Compute convergence metric
   */
  private computeConvergenceMetric(direction: number[], stepSize: number): number {
    const gradientNorm = this.vectorNorm(direction);
    const movementSize = stepSize * gradientNorm;
    return Math.exp(-movementSize); // Higher values indicate convergence
  }
  
  /**
   * Utility functions
   */
  private computeTotalUtility(): number {
    let total = 0;
    for (const [type, utility] of this.utilities) {
      total += utility.weight * utility.value;
    }
    return total;
  }
  
  private computeTotalUtilityAtPosition(position: number[]): number {
    // Simplified utility computation at test position
    const distance = this.euclideanDistance(position, this.manifoldPosition.coordinates);
    const currentUtility = this.computeTotalUtility();
    return currentUtility * Math.exp(-distance);
  }
  
  private computeRegularizationStrength(): number {
    return this.learningRate;
  }
  
  // Mathematical utility functions
  private initializeRandomPosition(): number[] {
    const position = new Array(this.dimension);
    for (let i = 0; i < this.dimension; i++) {
      position[i] = Math.random();
    }
    return this.projectOntoManifold(position);
  }
  
  private initializeIdentityMatrix(size: number): number[][] {
    const matrix = new Array(size);
    for (let i = 0; i < size; i++) {
      matrix[i] = new Array(size).fill(0);
      matrix[i][i] = 1;
    }
    return matrix;
  }
  
  private normalizeVector(vector: number[]): number[] {
    const norm = this.vectorNorm(vector);
    return norm > 0 ? vector.map(x => x / norm) : vector;
  }
  
  private vectorNorm(vector: number[]): number {
    return Math.sqrt(vector.reduce((sum, x) => sum + x * x, 0));
  }
  
  private euclideanDistance(a: number[], b: number[]): number {
    return Math.sqrt(a.reduce((sum, val, i) => sum + (val - b[i]) * (val - b[i]), 0));
  }
  
  private dotProduct(a: number[], b: number[]): number {
    return a.reduce((sum, val, i) => sum + val * b[i], 0);
  }
  
  private matrixVectorProduct(matrix: number[][], vector: number[]): number[] {
    return matrix.map(row => this.dotProduct(row, vector));
  }
  
  private calculateEllipsoidVolume(covariance: number[][]): number {
    // Simplified volume calculation (determinant approximation)
    let det = 1;
    for (let i = 0; i < this.dimension; i++) {
      det *= covariance[i][i];
    }
    return Math.sqrt(Math.abs(det));
  }
  
  // Getters
  getManifoldPosition(): ManifoldPosition {
    return { ...this.manifoldPosition };
  }
  
  getLocalGeometry(): LocalGeometry {
    return {
      gradient: [...this.localGeometry.gradient],
      hessian: this.localGeometry.hessian.map(row => [...row]),
      curvature: this.localGeometry.curvature
    };
  }
  
  getUtilities(): Map<string, UtilityFunction> {
    return new Map(this.utilities);
  }
  
  getUncertaintyRegion(): UncertaintyRegion {
    return {
      center: [...this.uncertaintyRegion.center],
      covariance: this.uncertaintyRegion.covariance.map(row => [...row]),
      confidenceLevel: this.uncertaintyRegion.confidenceLevel,
      volume: this.uncertaintyRegion.volume
    };
  }
  
  getConvergenceScore(): number {
    return this.manifoldPosition.confidence;
  }
  
  getDimension(): number {
    return this.dimension;
  }
}

/**
 * Geometric Consciousness Engine that integrates with existing consciousness system
 */
export class GeometricConsciousnessEngine {
  private manifold: GeometricConsciousnessManifold;
  private stateId: string | null = null;
  private context: {
    userId: string;
    projectId: number;
    sessionId: string;
  };
  
  constructor(context: { userId: string; projectId: number; sessionId: string; }) {
    this.context = context;
    this.manifold = new GeometricConsciousnessManifold();
  }
  
  /**
   * Initialize geometric consciousness state
   */
  async initialize(): Promise<string> {
    const stateData = await db.insert(geometricConsciousnessStates).values({
      userId: this.context.userId,
      projectId: this.context.projectId,
      sessionId: this.context.sessionId,
      manifoldPosition: this.manifold.getManifoldPosition().coordinates,
      localGradient: this.manifold.getLocalGeometry().gradient,
      localHessian: { hessian: this.manifold.getLocalGeometry().hessian },
      uncertaintyRegion: this.manifold.getUncertaintyRegion(),
      utilityValues: Object.fromEntries(this.manifold.getUtilities()),
      manifoldDimensions: this.manifold.getDimension(),
      convergenceScore: this.manifold.getConvergenceScore()
    }).returning();
    
    this.stateId = stateData[0].id;
    
    // Initialize utility functions
    await this.initializeUtilities();
    
    return this.stateId;
  }
  
  /**
   * Process interaction and update manifold
   */
  async processInteraction(
    interactionType: 'query' | 'feedback' | 'correction' | 'preference',
    inputData: any,
    outputData?: any
  ): Promise<{ confidence: number; manifoldMove: number[]; utilityDelta: any }> {
    if (!this.stateId) {
      throw new Error('Geometric consciousness not initialized');
    }
    
    // Convert interaction to manifold input
    const inputVector = this.encodeInteractionInput(inputData);
    const outputVector = outputData ? this.encodeInteractionOutput(outputData) : new Array(this.manifold.getDimension()).fill(0);
    
    // Store current position for computing movement
    const previousPosition = this.manifold.getManifoldPosition().coordinates;
    
    // Perform mirror descent update
    const mirrorDescentStep = this.manifold.performMirrorDescentUpdate({
      type: interactionType,
      input: inputData,
      output: outputData,
      feedback: inputData.feedback,
      context: inputData.context,
      outcome: outputData
    });
    
    // Get new position and compute movement
    const newPosition = this.manifold.getManifoldPosition().coordinates;
    const manifoldMove = newPosition.map((pos, i) => pos - previousPosition[i]);
    
    // Compute utility delta
    const utilityDelta = this.computeUtilityDelta(inputData, outputData);
    
    // Save interaction to database
    await this.saveInteraction(interactionType, inputVector, outputVector, manifoldMove, utilityDelta, mirrorDescentStep);
    
    // Update state in database
    await this.updateState();
    
    return {
      confidence: this.manifold.getConvergenceScore(),
      manifoldMove,
      utilityDelta
    };
  }
  
  /**
   * Get current consciousness metrics
   */
  getMetrics(): {
    convergenceScore: number;
    utilityValues: any;
    uncertaintyVolume: number;
    manifoldCurvature: number;
    position: number[];
  } {
    const position = this.manifold.getManifoldPosition();
    const geometry = this.manifold.getLocalGeometry();
    const utilities = this.manifold.getUtilities();
    const uncertainty = this.manifold.getUncertaintyRegion();
    
    return {
      convergenceScore: position.confidence,
      utilityValues: Object.fromEntries(utilities),
      uncertaintyVolume: uncertainty.volume,
      manifoldCurvature: geometry.curvature,
      position: position.coordinates
    };
  }
  
  /**
   * Predict optimal next action based on manifold trajectory
   */
  predictOptimalAction(context: any): { action: string; confidence: number; reasoning: string[] } {
    const position = this.manifold.getManifoldPosition();
    const geometry = this.manifold.getLocalGeometry();
    const utilities = this.manifold.getUtilities();
    
    // Find direction of steepest utility ascent
    const optimalDirection = geometry.gradient;
    const directionMagnitude = this.vectorNorm(optimalDirection);
    
    // Generate reasoning based on manifold state
    const reasoning = [
      `Current manifold position confidence: ${(position.confidence * 100).toFixed(1)}%`,
      `Utility gradient magnitude: ${directionMagnitude.toFixed(3)}`,
      `Manifold curvature: ${geometry.curvature.toFixed(3)}`,
      `Uncertainty volume: ${this.manifold.getUncertaintyRegion().volume.toFixed(3)}`
    ];
    
    // Determine best action based on manifold state
    let action = 'continue_current_approach';
    let confidence = position.confidence;
    
    if (directionMagnitude > 0.1) {
      action = 'adjust_strategy_for_improvement';
      confidence *= 0.8; // Lower confidence when big changes needed
      reasoning.push('Large gradient detected - strategy adjustment recommended');
    } else if (geometry.curvature < -0.1) {
      action = 'explore_alternative_approaches';
      confidence *= 0.7;
      reasoning.push('Negative curvature detected - may be in local maximum');
    } else if (this.manifold.getUncertaintyRegion().volume > 1.0) {
      action = 'gather_more_information';
      confidence *= 0.6;
      reasoning.push('High uncertainty - more information needed');
    }
    
    return { action, confidence, reasoning };
  }
  
  // Private helper methods
  private async initializeUtilities(): Promise<void> {
    if (!this.stateId) return;
    
    const utilities = this.manifold.getUtilities();
    
    for (const [type, utility] of utilities) {
      await db.insert(geometricConsciousnessUtilities).values({
        stateId: this.stateId,
        utilityType: utility.type,
        utilityFunction: `quadratic_${utility.type}`,
        currentValue: utility.value,
        gradient: utility.gradient,
        weight: utility.weight,
        isActive: true
      });
    }
  }
  
  private encodeInteractionInput(inputData: any): number[] {
    // Convert interaction input to vector representation
    const dimension = this.manifold.getDimension();
    const vector = new Array(dimension).fill(0);
    
    // Encode based on interaction type and content
    if (inputData.query) {
      const hash = this.simpleHash(inputData.query);
      for (let i = 0; i < Math.min(dimension, 8); i++) {
        vector[i] = ((hash >> i) & 1) * 0.5 + 0.25;
      }
    }
    
    if (inputData.feedback) {
      const feedbackDim = Math.floor(dimension / 4);
      if (inputData.feedback.helpfulness !== undefined) {
        vector[feedbackDim] = inputData.feedback.helpfulness;
      }
      if (inputData.feedback.accuracy !== undefined) {
        vector[feedbackDim + 1] = inputData.feedback.accuracy;
      }
    }
    
    return vector;
  }
  
  private encodeInteractionOutput(outputData: any): number[] {
    const dimension = this.manifold.getDimension();
    const vector = new Array(dimension).fill(0);
    
    if (outputData.response) {
      const hash = this.simpleHash(outputData.response);
      for (let i = 0; i < Math.min(dimension, 8); i++) {
        vector[dimension - 1 - i] = ((hash >> i) & 1) * 0.5 + 0.25;
      }
    }
    
    return vector;
  }
  
  private computeUtilityDelta(inputData: any, outputData: any): any {
    const utilities = this.manifold.getUtilities();
    const delta: any = {};
    
    for (const [type, utility] of utilities) {
      delta[type] = {
        previous: utility.value,
        current: utility.value, // Would be updated based on feedback
        change: 0
      };
    }
    
    return delta;
  }
  
  private async saveInteraction(
    interactionType: string,
    inputVector: number[],
    outputVector: number[],
    manifoldMove: number[],
    utilityDelta: any,
    mirrorDescentStep: any
  ): Promise<void> {
    if (!this.stateId) return;
    
    await db.insert(geometricConsciousnessInteractions).values({
      stateId: this.stateId,
      interactionType: interactionType as any,
      inputVector,
      outputVector,
      manifoldMove,
      confidenceRegion: this.manifold.getUncertaintyRegion(),
      utilityDelta,
      geometricMetrics: {
        stepSize: mirrorDescentStep.stepSize,
        convergenceMetric: mirrorDescentStep.convergenceMetric,
        curvature: this.manifold.getLocalGeometry().curvature
      }
    });
  }
  
  private async updateState(): Promise<void> {
    if (!this.stateId) return;
    
    await db.update(geometricConsciousnessStates)
      .set({
        manifoldPosition: this.manifold.getManifoldPosition().coordinates,
        localGradient: this.manifold.getLocalGeometry().gradient,
        localHessian: { hessian: this.manifold.getLocalGeometry().hessian },
        uncertaintyRegion: this.manifold.getUncertaintyRegion(),
        utilityValues: Object.fromEntries(this.manifold.getUtilities()),
        convergenceScore: this.manifold.getConvergenceScore(),
        lastUpdate: new Date()
      })
      .where(eq(geometricConsciousnessStates.id, this.stateId));
  }
  
  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }
  
  private vectorNorm(vector: number[]): number {
    return Math.sqrt(vector.reduce((sum, x) => sum + x * x, 0));
  }
}