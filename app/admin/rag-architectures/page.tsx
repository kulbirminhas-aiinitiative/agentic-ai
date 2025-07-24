"use client";
import Navigation from "../../components/Navigation";
import React, { useState } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

const ragTypes = [
	{
		key: "baseline",
		label: "Baseline RAG",
		description:
			"A linear pipeline where a query directly leads to retrieval of top-k chunks, which are then passed to the LLM. Effective for straightforward question-answering.",
		settings: ["Top-k", "Vector DB", "Prompt Augmentation"],
		default: { topK: 5, vectorDB: "Pinecone", promptAugmentation: true },
	},
	{
		key: "rerank",
		label: "Retrieve and Rerank RAG",
		description:
			"Initial broad retrieval followed by a reranking model (e.g., cross-encoder) for deeper relevance. Only top-ranked docs are passed to the LLM.",
		settings: ["Initial k", "Rerank Model", "Final k"],
		default: { initialK: 20, rerankModel: "cross-encoder", finalK: 5 },
	},
	{
		key: "multihop",
		label: "Multi-hop RAG",
		description:
			"Performs multi-stage retrieval. Output or intermediate reasoning from one retrieval step can become input for the next.",
		settings: ["Hops", "Retriever Type"],
		default: { hops: 2, retrieverType: "BM25+Vector" },
	},
	{
		key: "hyde",
		label: "HyDE (Hypothetical Document Embedding)",
		description:
			"Generates a hypothetical context or answer before retrieval. This synthetic doc is embedded and used to search the DB.",
		settings: ["HyDE Model", "Vector DB"],
		default: { hydeModel: "gpt-3.5", vectorDB: "Pinecone" },
	},
	{
		key: "graph",
		label: "Graph RAG",
		description:
			"Uses graph DBs to model relationships between documents/concepts. Retrieval considers both semantic similarity and graph structure.",
		settings: ["Graph DB", "Vector DB"],
		default: { graphDB: "Neo4j", vectorDB: "Pinecone" },
	},
	{
		key: "hybrid",
		label: "Hybrid RAG (Vector DB + Graph DB)",
		description:
			"Combines semantic vector retrieval with structured graph traversal. Results from both are merged and prioritized.",
		settings: ["Vector DB", "Graph DB", "Merge Strategy"],
		default: {
			vectorDB: "Pinecone",
			graphDB: "Neo4j",
			mergeStrategy: "priority",
		},
	},
	{
		key: "branched",
		label: "Branched RAG",
		description:
			"Splits a query into multiple sub-queries, each handled by a separate retriever or data source. Outputs are merged before generation.",
		settings: ["Branches", "Merge Strategy"],
		default: { branches: 2, mergeStrategy: "concat" },
	},
	{
		key: "sentencewindow",
		label: "Sentence Window Retrieval",
		description:
			"Uses a smaller window for embedding retrieval, but a broader context is passed to the LLM for generation.",
		settings: ["Window Size", "Context Size"],
		default: { windowSize: 3, contextSize: 10 },
	},
	{
		key: "crag",
		label: "Corrective RAG (CRAG)",
		description:
			"Adds an error-detection module that validates the generated response against reliable sources, triggering a correction loop if needed.",
		settings: ["Error Detection Model", "Correction Loop"],
		default: { errorDetectionModel: "gpt-4", correctionLoop: true },
	},
	{
		key: "selfrag",
		label: "Self-RAG",
		description:
			"System evaluates its own performance and can generate retrieval queries during generation, refining as it goes.",
		settings: ["Self-Eval Model", "Max Iterations"],
		default: { selfEvalModel: "gpt-4", maxIterations: 3 },
	},
	{
		key: "metarag",
		label: "MetaRAG",
		description:
			"Meta-layer analyzes query characteristics and determines the optimal retrieval strategy.",
		settings: ["Query Classifier", "Strategy Selector"],
		default: { queryClassifier: "BERT", strategySelector: "auto" },
	},
	{
		key: "adaptive",
		label: "Adaptive RAG",
		description:
			"Dynamically adjusts retrieval strategy based on query complexity in real-time.",
		settings: ["Adaptivity Level"],
		default: { adaptivityLevel: "medium" },
	},
	{
		key: "agentic",
		label: "Agentic RAG",
		description:
			"Model acts as an agent, planning and executing multi-step tasks using retrieved knowledge, possibly integrating with external tools.",
		settings: ["Planner Model", "Tool Integration"],
		default: { plannerModel: "gpt-4", toolIntegration: true },
	},
	{
		key: "modular",
		label: "Modular RAG",
		description:
			"Retrieval and generation are separate, independently optimized modules. Each can be fine-tuned or replaced.",
		settings: ["Retriever Module", "Generator Module"],
		default: { retrieverModule: "BM25", generatorModule: "gpt-4" },
	},
	{
		key: "multimodal",
		label: "Multimodal RAG",
		description:
			"Extends RAG to process images, videos, audio, and other modalities. Uses multimodal encoders and retrieves across modalities.",
		settings: ["Modalities", "Encoder Model"],
		default: { modalities: ["text", "image"], encoderModel: "CLIP" },
	},
	{
		key: "memo",
		label: "Memo RAG",
		description:
			"Retains context and continuity across user interactions, storing and utilizing memory from previous exchanges.",
		settings: ["Memory Window"],
		default: { memoryWindow: 5 },
	},
	{
		key: "speculative",
		label: "Speculative RAG",
		description:
			"Anticipates user needs by predicting queries and preparing relevant responses ahead of time.",
		settings: ["Prediction Model", "Prefetch Count"],
		default: { predictionModel: "gpt-3.5", prefetchCount: 2 },
	},
];

export default function RagArchitecturesAdmin() {
  const [selectedType, setSelectedType] = useState(ragTypes[0].key);
  const [customSettings, setCustomSettings] = useState<Record<string, any>>({});
  const [activeTab, setActiveTab] = useState<'settings' | 'workflow'>('settings');

  const selected = ragTypes.find(r => r.key === selectedType);

  function handleSettingChange(key: string, value: any) {
	setCustomSettings({
	  ...customSettings,
	  [selectedType]: { ...customSettings[selectedType], [key]: value }
	});
  }

  function handleResetDefaults() {
	setCustomSettings({
	  ...customSettings,
	  [selectedType]: { ...selected?.default }
	});
  }

  const settings = { ...selected?.default, ...customSettings[selectedType] };

  // React Flow node/edge definitions for each RAG type
  const ragFlowData: Record<string, { nodes: any[]; edges: any[] }> = {
		baseline: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Embed Query' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Vector DB Retrieval' } },
				{ id: '4', position: { x: 600, y: 0 }, data: { label: 'Top-k Chunks' } },
				{ id: '5', position: { x: 800, y: 0 }, data: { label: 'Prompt Augmentation' } },
				{ id: '6', position: { x: 1000, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '7', type: 'output', position: { x: 1200, y: 0 }, data: { label: 'Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-4', source: '3', target: '4' },
				{ id: 'e4-5', source: '4', target: '5' },
				{ id: 'e5-6', source: '5', target: '6' },
				{ id: 'e6-7', source: '6', target: '7' },
			],
		},
		rerank: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Embed Query' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Vector DB Retrieval' } },
				{ id: '4', position: { x: 600, y: 0 }, data: { label: 'Initial k Chunks' } },
				{ id: '5', position: { x: 800, y: 0 }, data: { label: 'Rerank Model' } },
				{ id: '6', position: { x: 1000, y: 0 }, data: { label: 'Top-n Chunks' } },
				{ id: '7', position: { x: 1200, y: 0 }, data: { label: 'Prompt Augmentation' } },
				{ id: '8', position: { x: 1400, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '9', type: 'output', position: { x: 1600, y: 0 }, data: { label: 'Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-4', source: '3', target: '4' },
				{ id: 'e4-5', source: '4', target: '5' },
				{ id: 'e5-6', source: '5', target: '6' },
				{ id: 'e6-7', source: '6', target: '7' },
				{ id: 'e7-8', source: '7', target: '8' },
				{ id: 'e8-9', source: '8', target: '9' },
			],
		},
		multihop: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Embed Query' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Retriever 1' } },
				{ id: '4', position: { x: 600, y: 0 }, data: { label: 'Intermediate Reasoning' } },
				{ id: '5', position: { x: 800, y: 0 }, data: { label: 'Retriever 2' } },
				{ id: '6', position: { x: 1000, y: 0 }, data: { label: 'Augmented Prompt' } },
				{ id: '7', position: { x: 1200, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '8', type: 'output', position: { x: 1400, y: 0 }, data: { label: 'Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-4', source: '3', target: '4' },
				{ id: 'e4-5', source: '4', target: '5' },
				{ id: 'e5-6', source: '5', target: '6' },
				{ id: 'e6-7', source: '6', target: '7' },
				{ id: 'e7-8', source: '7', target: '8' },
			],
		},
		hyde: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'HyDE Model Generates Hypothetical Answer' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Embed Hypothetical' } },
				{ id: '4', position: { x: 600, y: 0 }, data: { label: 'Vector DB Retrieval' } },
				{ id: '5', position: { x: 800, y: 0 }, data: { label: 'Prompt Augmentation' } },
				{ id: '6', position: { x: 1000, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '7', type: 'output', position: { x: 1200, y: 0 }, data: { label: 'Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-4', source: '3', target: '4' },
				{ id: 'e4-5', source: '4', target: '5' },
				{ id: 'e5-6', source: '5', target: '6' },
				{ id: 'e6-7', source: '6', target: '7' },
			],
		},
		graph: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Embed Query' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Graph DB Traversal' } },
				{ id: '4', position: { x: 600, y: 0 }, data: { label: 'Vector DB Retrieval' } },
				{ id: '5', position: { x: 800, y: 0 }, data: { label: 'Combine Results' } },
				{ id: '6', position: { x: 1000, y: 0 }, data: { label: 'Prompt Augmentation' } },
				{ id: '7', position: { x: 1200, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '8', type: 'output', position: { x: 1400, y: 0 }, data: { label: 'Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-4', source: '3', target: '4' },
				{ id: 'e4-5', source: '4', target: '5' },
				{ id: 'e5-6', source: '5', target: '6' },
				{ id: 'e6-7', source: '6', target: '7' },
				{ id: 'e7-8', source: '7', target: '8' },
			],
		},
		hybrid: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Embed Query' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Vector DB' } },
				{ id: '4', position: { x: 400, y: 100 }, data: { label: 'Graph DB' } },
				{ id: '5', position: { x: 600, y: 0 }, data: { label: 'Results Merge' } },
				{ id: '6', position: { x: 800, y: 0 }, data: { label: 'Prompt Augmentation' } },
				{ id: '7', position: { x: 1000, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '8', type: 'output', position: { x: 1200, y: 0 }, data: { label: 'Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-5', source: '3', target: '5' },
				{ id: 'e4-5', source: '4', target: '5' },
				{ id: 'e5-6', source: '5', target: '6' },
				{ id: 'e6-7', source: '6', target: '7' },
				{ id: 'e7-8', source: '7', target: '8' },
			],
		},
		branched: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Split to Sub-Queries' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Retriever 1' } },
				{ id: '4', position: { x: 400, y: 100 }, data: { label: 'Retriever 2' } },
				{ id: '5', position: { x: 600, y: 0 }, data: { label: 'Merge Results' } },
				{ id: '6', position: { x: 800, y: 0 }, data: { label: 'Prompt Augmentation' } },
				{ id: '7', position: { x: 1000, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '8', type: 'output', position: { x: 1200, y: 0 }, data: { label: 'Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e2-4', source: '2', target: '4' },
				{ id: 'e3-5', source: '3', target: '5' },
				{ id: 'e4-5', source: '4', target: '5' },
				{ id: 'e5-6', source: '5', target: '6' },
				{ id: 'e6-7', source: '6', target: '7' },
				{ id: 'e7-8', source: '7', target: '8' },
			],
		},
		sentencewindow: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Embed Query' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Sentence Window Retrieval' } },
				{ id: '4', position: { x: 600, y: 0 }, data: { label: 'Expand Context' } },
				{ id: '5', position: { x: 800, y: 0 }, data: { label: 'Prompt Augmentation' } },
				{ id: '6', position: { x: 1000, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '7', type: 'output', position: { x: 1200, y: 0 }, data: { label: 'Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-4', source: '3', target: '4' },
				{ id: 'e4-5', source: '4', target: '5' },
				{ id: 'e5-6', source: '5', target: '6' },
				{ id: 'e6-7', source: '6', target: '7' },
			],
		},
		crag: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Embed Query' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Vector DB Retrieval' } },
				{ id: '4', position: { x: 600, y: 0 }, data: { label: 'Prompt Augmentation' } },
				{ id: '5', position: { x: 800, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '6', position: { x: 1000, y: 0 }, data: { label: 'Error Detection' } },
				{ id: '7', position: { x: 1200, y: 0 }, data: { label: 'Correction Loop' } },
				{ id: '8', type: 'output', position: { x: 1400, y: 0 }, data: { label: 'Final Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-4', source: '3', target: '4' },
				{ id: 'e4-5', source: '4', target: '5' },
				{ id: 'e5-6', source: '5', target: '6' },
				{ id: 'e6-7', source: '6', target: '7' },
				{ id: 'e7-8', source: '7', target: '8' },
			],
		},
		selfrag: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Embed Query' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Vector DB Retrieval' } },
				{ id: '4', position: { x: 600, y: 0 }, data: { label: 'Prompt Augmentation' } },
				{ id: '5', position: { x: 800, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '6', position: { x: 1000, y: 0 }, data: { label: 'Self-Evaluation' } },
				{ id: '7', position: { x: 1200, y: 0 }, data: { label: 'Refine Retrieval' } },
				{ id: '8', type: 'output', position: { x: 1400, y: 0 }, data: { label: 'Final Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-4', source: '3', target: '4' },
				{ id: 'e4-5', source: '4', target: '5' },
				{ id: 'e5-6', source: '5', target: '6' },
				{ id: 'e6-7', source: '6', target: '7' },
				{ id: 'e7-8', source: '7', target: '8' },
			],
		},
		metarag: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Query Classifier' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Strategy Selector' } },
				{ id: '4', position: { x: 600, y: 0 }, data: { label: 'Custom Retrieval Path' } },
				{ id: '5', position: { x: 800, y: 0 }, data: { label: 'Prompt Augmentation' } },
				{ id: '6', position: { x: 1000, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '7', type: 'output', position: { x: 1200, y: 0 }, data: { label: 'Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-4', source: '3', target: '4' },
				{ id: 'e4-5', source: '4', target: '5' },
				{ id: 'e5-6', source: '5', target: '6' },
				{ id: 'e6-7', source: '6', target: '7' },
			],
		},
		adaptive: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Adaptivity Engine' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Dynamic Retrieval' } },
				{ id: '4', position: { x: 600, y: 0 }, data: { label: 'Prompt Augmentation' } },
				{ id: '5', position: { x: 800, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '6', type: 'output', position: { x: 1000, y: 0 }, data: { label: 'Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-4', source: '3', target: '4' },
				{ id: 'e4-5', source: '4', target: '5' },
				{ id: 'e5-6', source: '5', target: '6' },
			],
		},
		agentic: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Agent Planner' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Multi-Step Retrieval & Tool Use' } },
				{ id: '4', position: { x: 600, y: 0 }, data: { label: 'Prompt Augmentation' } },
				{ id: '5', position: { x: 800, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '6', type: 'output', position: { x: 1000, y: 0 }, data: { label: 'Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-4', source: '3', target: '4' },
				{ id: 'e4-5', source: '4', target: '5' },
			],
		},
		modular: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Retriever Module' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Prompt Augmentation' } },
				{ id: '4', position: { x: 600, y: 0 }, data: { label: 'Generator Module' } },
				{ id: '5', position: { x: 800, y: 0 }, data: { label: 'Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-4', source: '3', target: '4' },
				{ id: 'e4-5', source: '4', target: '5' },
			],
		},
		multimodal: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query (Text/Image/Audio)' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Multimodal Encoder' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Vector DB Retrieval' } },
				{ id: '4', position: { x: 600, y: 0 }, data: { label: 'Prompt Augmentation' } },
				{ id: '5', position: { x: 800, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '6', type: 'output', position: { x: 1000, y: 0 }, data: { label: 'Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-4', source: '3', target: '4' },
				{ id: 'e4-5', source: '4', target: '5' },
			],
		},
		memo: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Query' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Embed Query' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Vector DB Retrieval' } },
				{ id: '4', position: { x: 600, y: 0 }, data: { label: 'Prompt Augmentation + Memory' } },
				{ id: '5', position: { x: 800, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '6', type: 'output', position: { x: 1000, y: 0 }, data: { label: 'Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-4', source: '3', target: '4' },
				{ id: 'e4-5', source: '4', target: '5' },
			],
		},
		speculative: {
			nodes: [
				{ id: '1', type: 'input', position: { x: 0, y: 0 }, data: { label: 'User Context' } },
				{ id: '2', position: { x: 200, y: 0 }, data: { label: 'Prediction Model' } },
				{ id: '3', position: { x: 400, y: 0 }, data: { label: 'Prefetch Relevant Data' } },
				{ id: '4', position: { x: 600, y: 0 }, data: { label: 'Prompt Augmentation' } },
				{ id: '5', position: { x: 800, y: 0 }, data: { label: 'LLM Generation' } },
				{ id: '6', type: 'output', position: { x: 1000, y: 0 }, data: { label: 'Response' } },
			],
			edges: [
				{ id: 'e1-2', source: '1', target: '2' },
				{ id: 'e2-3', source: '2', target: '3' },
				{ id: 'e3-4', source: '3', target: '4' },
				{ id: 'e4-5', source: '4', target: '5' },
			],
		},
	};

	return (
		<div style={{ background: "#f8fafc", minHeight: "100vh" }}>
			<Navigation />
			<div style={{ display: "flex", maxWidth: 1200, margin: "0 auto", padding: "3rem 1.5rem" }}>
				{/* Sidebar */}
				<aside style={{ width: 260, background: "#fff", borderRight: "1px solid #e5e7eb", padding: "2rem 1rem", minHeight: 600 }}>
					<h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 18 }}>RAG Architectures</h2>
					<nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
						{ragTypes.map(r => (
							<button key={r.key} onClick={() => { setSelectedType(r.key); setActiveTab('settings'); }} style={{
								background: selectedType === r.key ? "#38bdf8" : "#f1f5f9",
								color: selectedType === r.key ? "#fff" : "#181e2a",
								border: "none",
								borderRadius: 6,
								padding: "10px 14px",
								fontWeight: 600,
								textAlign: "left",
								cursor: "pointer"
							}}>{r.label}</button>
						))}
					</nav>
				</aside>
				{/* Main Content */}
				<main style={{ flex: 1, padding: "0 2rem" }}>
					<h1 style={{ fontSize: 28, fontWeight: 800, color: "#181e2a", marginBottom: 18 }}>{selected?.label}</h1>
					<p style={{ color: "#64748b", fontSize: 17, marginBottom: 18 }}>{selected?.description}</p>
					{/* Tab Buttons */}
					<div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
						<button
							onClick={() => setActiveTab('settings')}
							style={{
								background: activeTab === 'settings' ? '#38bdf8' : '#f1f5f9',
								color: activeTab === 'settings' ? '#fff' : '#181e2a',
								border: 'none',
								borderRadius: 6,
								padding: '8px 18px',
								fontWeight: 600,
								cursor: 'pointer'
							}}
						>Settings</button>
						<button
							onClick={() => setActiveTab('workflow')}
							style={{
								background: activeTab === 'workflow' ? '#38bdf8' : '#f1f5f9',
								color: activeTab === 'workflow' ? '#fff' : '#181e2a',
								border: 'none',
								borderRadius: 6,
								padding: '8px 18px',
								fontWeight: 600,
								cursor: 'pointer'
							}}
						>Workflow / Architecture Diagram</button>
					</div>
					{/* Tab Content */}
					{activeTab === 'settings' && (
					  <>
						<h3 style={{ fontSize: 20, fontWeight: 700, marginTop: 0 }}>Settings</h3>
						{/* RAG Architecture Dropdown */}
						<div style={{ marginBottom: 18 }}>
						  <label style={{ fontWeight: 600, marginRight: 10 }}>RAG Architecture:</label>
						  <select
							value={selectedType}
							onChange={e => setSelectedType(e.target.value)}
							style={{ padding: '8px 14px', borderRadius: 6, border: '1.5px solid #cbd5e1', fontSize: 16 }}
						  >
							{ragTypes.map(r => (
							  <option key={r.key} value={r.key}>{r.label}</option>
							))}
						  </select>
						</div>
							<form style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 400 }}>
								{selected?.settings.map((key: string) => (
									<label key={key} style={{ fontWeight: 600, color: "#222", marginBottom: 4 }}>
										{key}
										<input
											type="text"
											value={settings[key] ?? ''}
											onChange={e => handleSettingChange(key, e.target.value)}
											style={{
												padding: "10px 14px",
												borderRadius: 8,
												border: "1.5px solid #cbd5e1",
												fontSize: 16,
												marginTop: 4,
												marginBottom: 2,
												fontWeight: 500,
												background: "#f8fafc",
												color: "#222"
											}}
										/>
									</label>
								))}
							</form>
							<button onClick={handleResetDefaults} style={{ marginTop: 16, background: '#e0e7ef', color: '#181e2a', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>
								Reset to Default
							</button>
							<div style={{ marginTop: 32 }}>
								<h3 style={{ fontSize: 18, fontWeight: 700 }}>Default Settings</h3>
								<pre style={{ background: "#f1f5f9", padding: 16, borderRadius: 8, fontSize: 15 }}>{JSON.stringify(selected?.default, null, 2)}</pre>
							</div>
						</>
					)}
					{activeTab === 'workflow' && (
						<>
							<h3 style={{ fontSize: 18, fontWeight: 700 }}>Workflow / Architecture Diagram</h3>
							<div style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px #0001', minHeight: 300 }}>
								<ReactFlow
									nodes={ragFlowData[selectedType]?.nodes || []}
									edges={ragFlowData[selectedType]?.edges || []}
									fitView
									style={{ width: '100%', minHeight: 250 }}
								>
									<Background />
									<Controls />
								</ReactFlow>
							</div>
						</>
					)}
				</main>
			</div>
		</div>
	);
}
