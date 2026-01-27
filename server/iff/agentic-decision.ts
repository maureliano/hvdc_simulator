/**
 * Dimensão 4: Decisão Agêntica com Bloqueio Automático (Agentic Decision with Auto-Blocking)
 *
 * Implementa sistema autônomo de decisão que bloqueia operações quando a fidelidade
 * do Digital Twin está abaixo de limites aceitáveis, garantindo segurança operacional.
 *
 * Estratégias de Decisão:
 * - Bloqueio Preventivo: Impede operações de risco
 * - Bloqueio Corretivo: Interrompe operações em andamento
 * - Modo Degradado: Reduz funcionalidades mantendo segurança
 * - Modo Seguro: Apenas operações críticas permitidas
 */

export type DecisionAction = "allow" | "block" | "degrade" | "safe_mode";
export type OperationType = "control" | "measurement" | "prediction" | "optimization";

export interface DecisionContext {
  operation_type: OperationType;
  dynamic_fidelity_index: number; // 0-100
  overall_uncertainty_percent: number;
  hil_validation_status: "validated" | "partially_validated" | "not_validated";
  system_status: "normal" | "transient" | "fault";
  risk_level: "low" | "medium" | "high" | "critical";
}

export interface AgenticDecision {
  timestamp: number;
  decision_id: string;
  action: DecisionAction;
  operation_allowed: boolean;
  confidence: number; // 0-100
  reasoning: string;
  recommendations: string[];
  blocking_reasons: string[];
  safety_margin: number; // % de margem até o limite crítico
}

export class AgenticDecisionMaker {
  private decisionThresholds = {
    allow: {
      min_dfi: 85,
      max_uncertainty: 5,
      hil_required: false,
    },
    degrade: {
      min_dfi: 70,
      max_uncertainty: 10,
      hil_required: false,
    },
    safe_mode: {
      min_dfi: 50,
      max_uncertainty: 20,
      hil_required: false,
    },
    block: {
      min_dfi: 0,
      max_uncertainty: 100,
      hil_required: true,
    },
  };

  private operationRiskLevels: Record<OperationType, number> = {
    measurement: 1, // Baixo risco
    prediction: 2, // Médio risco
    control: 3, // Alto risco
    optimization: 4, // Crítico
  };

  /**
   * Toma decisão sobre permitir operação
   */
  makeDecision(context: DecisionContext): AgenticDecision {
    const decisionId = `DECISION_${Date.now()}`;
    const timestamp = Date.now();

    // Avaliar contexto
    const riskAssessment = this.assessRisk(context);
    const fidelityScore = this.calculateFidelityScore(context);
    const safetyMargin = this.calculateSafetyMargin(context);

    // Determinar ação
    let action: DecisionAction;
    let operationAllowed: boolean;
    let confidence: number;
    let reasoning: string;
    let recommendations: string[] = [];
    let blockingReasons: string[] = [];

    // Lógica de decisão
    if (
      context.dynamic_fidelity_index >= this.decisionThresholds.allow.min_dfi &&
      context.overall_uncertainty_percent <= this.decisionThresholds.allow.max_uncertainty &&
      riskAssessment.risk_level !== "critical"
    ) {
      action = "allow";
      operationAllowed = true;
      confidence = Math.min(context.dynamic_fidelity_index, 100);
      reasoning = `Digital Twin fidelidade (${context.dynamic_fidelity_index}%) e incerteza (${context.overall_uncertainty_percent}%) dentro de limites aceitáveis.`;
      recommendations.push("Operação segura. Continuar monitoramento.");
    } else if (
      context.dynamic_fidelity_index >= this.decisionThresholds.degrade.min_dfi &&
      context.overall_uncertainty_percent <= this.decisionThresholds.degrade.max_uncertainty
    ) {
      action = "degrade";
      operationAllowed = true;
      confidence = 60;
      reasoning = `Fidelidade reduzida (${context.dynamic_fidelity_index}%). Operação permitida com funcionalidades limitadas.`;
      recommendations.push("Reduzir velocidade de operação");
      recommendations.push("Aumentar frequência de validação HIL");
      recommendations.push("Desabilitar otimizações automáticas");
    } else if (
      context.dynamic_fidelity_index >= this.decisionThresholds.safe_mode.min_dfi
    ) {
      action = "safe_mode";
      operationAllowed = context.operation_type === "measurement";
      confidence = 40;
      reasoning = `Fidelidade crítica (${context.dynamic_fidelity_index}%). Sistema em modo seguro.`;
      recommendations.push("Ativar modo seguro");
      recommendations.push("Apenas medições permitidas");
      recommendations.push("Aguardar validação HIL completa");
      blockingReasons.push("Fidelidade abaixo do limite crítico");
    } else {
      action = "block";
      operationAllowed = false;
      confidence = 20;
      reasoning = `Fidelidade insuficiente (${context.dynamic_fidelity_index}%). Operação bloqueada por segurança.`;
      recommendations.push("Investigar causa da baixa fidelidade");
      recommendations.push("Executar validação HIL completa");
      recommendations.push("Recalibrar parâmetros do Digital Twin");
      blockingReasons.push("Fidelidade crítica");
      blockingReasons.push("Incerteza excessiva");
    }

    // Ajustar baseado em status do sistema
    if (context.system_status === "fault") {
      if (action === "allow") {
        action = "degrade";
        operationAllowed = true;
        confidence = Math.max(30, confidence - 20);
        recommendations.push("Sistema em condição de falta. Modo degradado ativado.");
      } else if (action === "degrade") {
        action = "safe_mode";
        operationAllowed = false;
        confidence = 20;
        blockingReasons.push("Falta detectada no sistema");
      }
    }

    // Ajustar baseado em validação HIL
    if (
      context.hil_validation_status === "not_validated" &&
      context.operation_type === "optimization"
    ) {
      operationAllowed = false;
      action = "block";
      blockingReasons.push("Validação HIL não concluída para operações de otimização");
    }

    return {
      timestamp,
      decision_id: decisionId,
      action,
      operation_allowed: operationAllowed,
      confidence: Math.round(confidence * 100) / 100,
      reasoning,
      recommendations,
      blocking_reasons: blockingReasons,
      safety_margin: Math.round(safetyMargin * 100) / 100,
    };
  }

  /**
   * Avalia nível de risco da operação
   */
  private assessRisk(context: DecisionContext): {
    risk_level: "low" | "medium" | "high" | "critical";
    risk_score: number;
  } {
    let riskScore = 0;

    // Risco baseado em tipo de operação
    riskScore += this.operationRiskLevels[context.operation_type] * 20;

    // Risco baseado em fidelidade
    if (context.dynamic_fidelity_index < 50) {
      riskScore += 30;
    } else if (context.dynamic_fidelity_index < 70) {
      riskScore += 20;
    } else if (context.dynamic_fidelity_index < 85) {
      riskScore += 10;
    }

    // Risco baseado em incerteza
    if (context.overall_uncertainty_percent > 15) {
      riskScore += 20;
    } else if (context.overall_uncertainty_percent > 10) {
      riskScore += 10;
    }

    // Risco baseado em status do sistema
    if (context.system_status === "fault") {
      riskScore += 30;
    } else if (context.system_status === "transient") {
      riskScore += 15;
    }

    let riskLevel: "low" | "medium" | "high" | "critical";
    if (riskScore >= 80) {
      riskLevel = "critical";
    } else if (riskScore >= 60) {
      riskLevel = "high";
    } else if (riskScore >= 40) {
      riskLevel = "medium";
    } else {
      riskLevel = "low";
    }

    return { risk_level: riskLevel, risk_score: riskScore };
  }

  /**
   * Calcula score de fidelidade agregado
   */
  private calculateFidelityScore(context: DecisionContext): number {
    // Combinar DFI e validação HIL
    let score = context.dynamic_fidelity_index;

    if (context.hil_validation_status === "validated") {
      score = Math.min(100, score + 10);
    } else if (context.hil_validation_status === "not_validated") {
      score = Math.max(0, score - 15);
    }

    return Math.round(score * 100) / 100;
  }

  /**
   * Calcula margem de segurança até o limite crítico
   */
  private calculateSafetyMargin(context: DecisionContext): number {
    const criticalThreshold = this.decisionThresholds.safe_mode.min_dfi;
    const margin = context.dynamic_fidelity_index - criticalThreshold;
    return Math.max(0, margin);
  }

  /**
   * Gera log de auditoria da decisão
   */
  generateAuditLog(decision: AgenticDecision): string {
    const timestamp = new Date(decision.timestamp).toISOString();
    const blockingReasons = decision.blocking_reasons.join(", ") || "None";
    const recommendations = decision.recommendations.join("; ");
    return `[${timestamp}] DECISION: ${decision.decision_id}\nAction: ${decision.action}\nAllowed: ${decision.operation_allowed}\nConfidence: ${decision.confidence}%\nReasoning: ${decision.reasoning}\nBlocking Reasons: ${blockingReasons}\nRecommendations: ${recommendations}\nSafety Margin: ${decision.safety_margin}%`;
  }
}

export default AgenticDecisionMaker;
