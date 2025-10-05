import neo4j, { Driver, Session, Result } from 'neo4j-driver';
import { MLServiceClient } from '../../python_bridge/MLServiceClient';

export interface GraphDocument {
  id: string;
  type: 'SEC_FILING' | 'INTERNAL_DOC' | 'WHISTLEBLOWER' | 'EMAIL' | 'MEMO';
  date: Date;
  title: string;
  text: string;
  author?: string;
  department?: string;
}

export interface Claim {
  id: string;
  text: string;
  type: 'FINANCIAL' | 'REGULATORY' | 'RISK' | 'OPERATIONAL' | 'GENERAL';
  confidence: number;
  entities: Array<{ name: string; type: string; value?: number }>;
  documentId: string;
  timestamp: Date;
  embedding?: number[];
}

export interface ContradictionRelationship {
  id: string;
  fromClaimId: string;
  toClaimId: string;
  confidence: number;
  semanticSimilarity: number;
  detectedDate: Date;
  contradictionType: 'semantic' | 'factual' | 'temporal' | 'financial';
  severity: number;
}

export interface ContradictionChain {
  documents: string[];
  claims: string[];
  chainLength: number;
  overallSeverity: number;
  timeline: Array<{ date: Date; claimId: string; documentId: string }>;
  pattern: string;
}

export interface GraphAnalysisResult {
  totalDocuments: number;
  totalClaims: number;
  totalContradictions: number;
  contradictionChains: ContradictionChain[];
  temporalPatterns: Array<{
    pattern: string;
    frequency: number;
    severity: number;
    documents: string[];
  }>;
  entityNetwork: Array<{
    entity: string;
    connections: number;
    contradictionCount: number;
    riskScore: number;
  }>;
}

export class ContradictionKnowledgeGraph {
  private driver: Driver;
  private mlService: MLServiceClient;
  private initialized: boolean = false;

  constructor(
    uri: string = 'bolt://localhost:7687',
    user: string = 'neo4j',
    password: string = 'nits_password_2024',
    mlServiceUrl: string = 'http://localhost:5000'
  ) {
    this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    this.mlService = new MLServiceClient(mlServiceUrl);
  }

  /**
   * Initialize the knowledge graph with schema and constraints
   */
  async initialize(): Promise<void> {
    console.log('🔗 Initializing Neo4j knowledge graph...');
    
    const session = this.driver.session();
    
    try {
      // Create constraints for unique identifiers
      await session.run(`
        CREATE CONSTRAINT document_id IF NOT EXISTS
        FOR (d:Document) REQUIRE d.id IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT claim_id IF NOT EXISTS
        FOR (c:Claim) REQUIRE c.id IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT entity_name_type IF NOT EXISTS
        FOR (e:Entity) REQUIRE (e.name, e.type) IS UNIQUE
      `);

      // Create indexes for performance
      await session.run(`
        CREATE INDEX claim_timestamp IF NOT EXISTS
        FOR (c:Claim) ON (c.timestamp)
      `);

      await session.run(`
        CREATE INDEX document_date IF NOT EXISTS
        FOR (d:Document) ON (d.date)
      `);

      await session.run(`
        CREATE INDEX contradiction_confidence IF NOT EXISTS
        FOR ()-[r:CONTRADICTS]-() ON (r.confidence)
      `);

      this.initialized = true;
      console.log('✅ Neo4j knowledge graph initialized with schema and indexes');

    } catch (error) {
      console.error('❌ Failed to initialize knowledge graph:', error);
      throw new Error(`Knowledge graph initialization failed: ${error}`);
    } finally {
      await session.close();
    }
  }

  /**
   * Build knowledge graph from documents
   */
  async buildKnowledgeGraph(documents: GraphDocument[]): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    console.log(`🔗 Building knowledge graph for ${documents.length} documents...`);
    const session = this.driver.session();

    try {
      // Step 1: Create document nodes
      await this.createDocumentNodes(session, documents);

      // Step 2: Extract claims and create claim nodes
      const allClaims: Claim[] = [];
      for (const doc of documents) {
        const claims = await this.extractClaimsFromDocument(doc);
        allClaims.push(...claims);
        await this.createClaimNodes(session, claims, doc.id);
      }

      console.log(`   Extracted ${allClaims.length} claims from documents`);

      // Step 3: Generate embeddings for claims
      if (allClaims.length > 0) {
        await this.generateClaimEmbeddings(session, allClaims);
      }

      // Step 4: Detect contradictions using ML service
      await this.detectContradictionsInGraph(session);

      // Step 5: Build temporal relationship chains
      await this.buildTemporalChains(session);

      console.log('✅ Knowledge graph built successfully');

    } catch (error) {
      console.error('❌ Failed to build knowledge graph:', error);
      throw new Error(`Knowledge graph building failed: ${error}`);
    } finally {
      await session.close();
    }
  }

  /**
   * Create document nodes in the graph
   */
  private async createDocumentNodes(session: Session, documents: GraphDocument[]): Promise<void> {
    console.log('   📄 Creating document nodes...');
    
    for (const doc of documents) {
      await session.run(`
        MERGE (d:Document {id: $id})
        SET d.type = $type,
            d.date = datetime($date),
            d.title = $title,
            d.author = $author,
            d.department = $department,
            d.wordCount = $wordCount
      `, {
        id: doc.id,
        type: doc.type,
        date: doc.date.toISOString(),
        title: doc.title,
        author: doc.author || 'Unknown',
        department: doc.department || 'Unknown',
        wordCount: doc.text.split(/\s+/).length
      });
    }
  }

  /**
   * Extract claims from a document using NLP and pattern recognition
   */
  private async extractClaimsFromDocument(document: GraphDocument): Promise<Claim[]> {
    const claims: Claim[] = [];
    
    // Split document into sentences
    const sentences = document.text.match(/[^.!?]+[.!?]+/g) || [];
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      
      if (sentence.length < 20) continue; // Skip very short sentences
      
      // Classify claim type
      const claimType = this.classifyClaimType(sentence);
      
      // Calculate confidence based on sentence characteristics
      const confidence = this.calculateClaimConfidence(sentence, claimType);
      
      if (confidence > 0.3) { // Only include claims with reasonable confidence
        // Extract entities from the sentence
        let entities: Array<{ name: string; type: string; value?: number }> = [];
        try {
          const mlEntities = await this.mlService.extractEntities(sentence);
          entities = mlEntities.map(e => ({
            name: e.text,
            type: e.type,
            value: e.value
          }));
        } catch (error) {
          console.warn(`Entity extraction failed for sentence: ${error}`);
          entities = this.extractEntitiesWithRegex(sentence);
        }

        const claim: Claim = {
          id: `${document.id}_claim_${i}`,
          text: sentence,
          type: claimType,
          confidence: confidence,
          entities: entities,
          documentId: document.id,
          timestamp: document.date
        };

        claims.push(claim);
      }
    }

    return claims.filter(claim => claim.confidence > 0.5); // Keep only high-confidence claims
  }

  /**
   * Classify the type of claim based on keywords and context
   */
  private classifyClaimType(text: string): 'FINANCIAL' | 'REGULATORY' | 'RISK' | 'OPERATIONAL' | 'GENERAL' {
    const lowerText = text.toLowerCase();
    
    const financialKeywords = ['revenue', 'profit', 'loss', 'earnings', 'financial', 'cost', 'expense', 'sales', 'income'];
    const regulatoryKeywords = ['comply', 'regulation', 'requirement', 'disclosure', 'sec', 'rule', 'cfr'];
    const riskKeywords = ['risk', 'uncertain', 'may', 'could', 'potential', 'exposure', 'threat', 'danger'];
    const operationalKeywords = ['operations', 'manufacturing', 'production', 'service', 'process', 'efficiency'];

    if (financialKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'FINANCIAL';
    } else if (regulatoryKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'REGULATORY';
    } else if (riskKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'RISK';
    } else if (operationalKeywords.some(keyword => lowerText.includes(keyword))) {
      return 'OPERATIONAL';
    } else {
      return 'GENERAL';
    }
  }

  /**
   * Calculate confidence score for a claim
   */
  private calculateClaimConfidence(text: string, type: string): number {
    let confidence = 0.5; // Base confidence
    
    // Boost confidence for specific claim types with strong indicators
    const lowerText = text.toLowerCase();
    
    if (type === 'FINANCIAL' && /\$[\d,]+/.test(text)) {
      confidence += 0.3; // Financial claims with dollar amounts
    }
    
    if (type === 'REGULATORY' && /\b\d+\s+cfr\b/.test(lowerText)) {
      confidence += 0.3; // Regulatory claims with CFR citations
    }
    
    // Reduce confidence for uncertain language
    if (/\b(may|might|could|possibly|perhaps)\b/.test(lowerText)) {
      confidence -= 0.2;
    }
    
    // Boost confidence for definitive statements
    if (/\b(is|are|will|must|shall|has|have)\b/.test(lowerText)) {
      confidence += 0.1;
    }
    
    // Sentence length factor (too short or too long reduces confidence)
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 5 || wordCount > 50) {
      confidence -= 0.2;
    }
    
    return Math.max(0, Math.min(1, confidence));
  }

  /**
   * Extract entities using regex patterns (fallback method)
   */
  private extractEntitiesWithRegex(text: string): Array<{ name: string; type: string; value?: number }> {
    const entities: Array<{ name: string; type: string; value?: number }> = [];
    
    // Extract monetary amounts
    const moneyRegex = /\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*(million|billion|M|B)?/gi;
    let match;
    while ((match = moneyRegex.exec(text)) !== null) {
      let value = parseFloat(match[1].replace(/,/g, ''));
      const multiplier = match[2]?.toLowerCase();
      if (multiplier === 'million' || multiplier === 'm') value *= 1e6;
      if (multiplier === 'billion' || multiplier === 'b') value *= 1e9;
      
      entities.push({
        name: match[0],
        type: 'MONEY',
        value: value
      });
    }
    
    // Extract dates
    const dateRegex = /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/gi;
    while ((match = dateRegex.exec(text)) !== null) {
      entities.push({
        name: match[0],
        type: 'DATE'
      });
    }
    
    return entities;
  }

  /**
   * Create claim nodes and relationships in the graph
   */
  private async createClaimNodes(session: Session, claims: Claim[], documentId: string): Promise<void> {
    for (const claim of claims) {
      // Create claim node
      await session.run(`
        MATCH (d:Document {id: $documentId})
        MERGE (c:Claim {id: $claimId})
        SET c.text = $text,
            c.type = $type,
            c.confidence = $confidence,
            c.timestamp = datetime($timestamp)
        MERGE (d)-[:CONTAINS]->(c)
      `, {
        documentId: documentId,
        claimId: claim.id,
        text: claim.text,
        type: claim.type,
        confidence: claim.confidence,
        timestamp: claim.timestamp.toISOString()
      });

      // Create entity relationships
      for (const entity of claim.entities) {
        await session.run(`
          MATCH (c:Claim {id: $claimId})
          MERGE (e:Entity {name: $entityName, type: $entityType})
          SET e.value = $entityValue
          MERGE (c)-[:MENTIONS]->(e)
        `, {
          claimId: claim.id,
          entityName: entity.name,
          entityType: entity.type,
          entityValue: entity.value || null
        });
      }
    }
  }

  /**
   * Generate embeddings for claims using ML service
   */
  private async generateClaimEmbeddings(session: Session, claims: Claim[]): Promise<void> {
    console.log('   🧠 Generating claim embeddings...');
    
    try {
      const capabilities = await this.mlService.getCapabilities();
      if (!capabilities.embeddings) {
        console.log('⚠️  ML service embeddings not available, skipping embedding generation');
        return;
      }

      const texts = claims.map(c => c.text);
      const embeddings = await this.mlService.generateEmbeddings(texts);

      // Store embeddings in graph
      for (let i = 0; i < claims.length; i++) {
        await session.run(`
          MATCH (c:Claim {id: $claimId})
          SET c.embedding = $embedding
        `, {
          claimId: claims[i].id,
          embedding: embeddings[i]
        });
      }

      console.log(`   ✅ Generated embeddings for ${claims.length} claims`);

    } catch (error) {
      console.warn('Embedding generation failed:', error);
    }
  }

  /**
   * Detect contradictions between claims using ML service
   */
  private async detectContradictionsInGraph(session: Session): Promise<void> {
    console.log('   🔍 Detecting contradictions in knowledge graph...');

    try {
      // Find semantically similar claims that might contradict
      const result = await session.run(`
        MATCH (c1:Claim)-[:MENTIONS]->(e:Entity)
        MATCH (c2:Claim)-[:MENTIONS]->(e)
        WHERE c1.timestamp < c2.timestamp AND id(c1) < id(c2)
        AND c1.embedding IS NOT NULL AND c2.embedding IS NOT NULL
        WITH c1, c2,
             reduce(s = 0.0, i IN range(0, size(c1.embedding)-1) | 
               s + c1.embedding[i] * c2.embedding[i]) /
             (sqrt(reduce(s = 0.0, i IN range(0, size(c1.embedding)-1) | 
               s + c1.embedding[i] * c1.embedding[i])) *
              sqrt(reduce(s = 0.0, i IN range(0, size(c2.embedding)-1) | 
               s + c2.embedding[i] * c2.embedding[i]))) AS similarity
        WHERE similarity > 0.85
        RETURN c1.id as claim1_id, c1.text as claim1, 
               c2.id as claim2_id, c2.text as claim2, 
               similarity
        LIMIT 500
      `);

      const pairs: [string, string][] = [];
      const pairMetadata: Array<{ c1Id: string; c2Id: string; similarity: number }> = [];

      result.records.forEach(record => {
        pairs.push([record.get('claim1'), record.get('claim2')]);
        pairMetadata.push({
          c1Id: record.get('claim1_id'),
          c2Id: record.get('claim2_id'),
          similarity: record.get('similarity')
        });
      });

      if (pairs.length === 0) {
        console.log('   No contradiction candidates found');
        return;
      }

      // Check for contradictions using ML service
      const capabilities = await this.mlService.getCapabilities();
      if (!capabilities.contradiction_detection) {
        console.log('⚠️  ML service contradiction detection not available, skipping');
        return;
      }

      const predictions = await this.mlService.detectContradictions(pairs);

      // Create contradiction relationships
      let contradictionCount = 0;
      for (let i = 0; i < predictions.length; i++) {
        const pred = predictions[i];
        const meta = pairMetadata[i];

        if (pred.label === 'contradiction' && pred.contradiction_prob >= 0.75) {
          const severity = this.calculateContradictionSeverity(pred.contradiction_prob, meta.similarity);
          
          await session.run(`
            MATCH (c1:Claim {id: $c1Id})
            MATCH (c2:Claim {id: $c2Id})
            MERGE (c1)-[r:CONTRADICTS]->(c2)
            SET r.confidence = $confidence,
                r.similarity = $similarity,
                r.severity = $severity,
                r.detected_date = datetime(),
                r.type = 'semantic'
          `, {
            c1Id: meta.c1Id,
            c2Id: meta.c2Id,
            confidence: pred.contradiction_prob,
            similarity: meta.similarity,
            severity: severity
          });
          
          contradictionCount++;
        }
      }

      console.log(`   ✅ Created ${contradictionCount} contradiction relationships`);

    } catch (error) {
      console.error('Contradiction detection failed:', error);
    }
  }

  /**
   * Calculate contradiction severity
   */
  private calculateContradictionSeverity(confidence: number, similarity: number): number {
    return Math.min(100, (confidence * 70) + (similarity * 30));
  }

  /**
   * Build temporal chains of contradictions
   */
  private async buildTemporalChains(session: Session): Promise<void> {
    console.log('   ⏰ Building temporal contradiction chains...');

    await session.run(`
      MATCH path = (d1:Document)-[:CONTAINS]->(c1:Claim)-[:CONTRADICTS*1..3]->(c2:Claim)<-[:CONTAINS]-(d2:Document)
      WHERE d1.date < d2.date
      WITH path, length(path) as pathLength
      WHERE pathLength > 2
      MERGE (chain:ContradictionChain {
        id: apoc.create.uuid(),
        length: pathLength,
        created: datetime()
      })
      WITH chain, path
      UNWIND relationships(path) as rel
      MERGE (chain)-[:INCLUDES_RELATIONSHIP]->(rel)
    `);
  }

  /**
   * Find contradiction chains in the knowledge graph
   */
  async findContradictionChains(): Promise<ContradictionChain[]> {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH (d:Document)-[:CONTAINS]->(c:Claim)
        MATCH path = (c)-[:CONTRADICTS*1..3]->(c2:Claim)
        WITH d, collect(DISTINCT path) as paths,
             count(DISTINCT path) as chain_length
        WHERE chain_length > 2
        RETURN d.id as document_id, 
               d.type as document_type, 
               d.title as title,
               chain_length,
               [p IN paths | [n IN nodes(p) WHERE n:Claim | n.id]] as claim_chains
        ORDER BY chain_length DESC
        LIMIT 20
      `);

      const chains: ContradictionChain[] = [];

      result.records.forEach(record => {
        const documentId = record.get('document_id');
        const chainLength = record.get('chain_length');
        const claimChains = record.get('claim_chains');

        const chain: ContradictionChain = {
          documents: [documentId],
          claims: claimChains.flat(),
          chainLength: chainLength,
          overallSeverity: chainLength * 15, // Simplified severity calculation
          timeline: [],
          pattern: `Document ${documentId} contains ${chainLength} contradiction chains`
        };

        chains.push(chain);
      });

      return chains;

    } finally {
      await session.close();
    }
  }

  /**
   * Analyze the knowledge graph for patterns and insights
   */
  async analyzeGraph(): Promise<GraphAnalysisResult> {
    const session = this.driver.session();
    
    try {
      console.log('📊 Analyzing knowledge graph patterns...');

      // Get basic counts
      const countsResult = await session.run(`
        MATCH (d:Document) WITH count(d) as docs
        MATCH (c:Claim) WITH docs, count(c) as claims
        MATCH ()-[r:CONTRADICTS]->() 
        RETURN docs, claims, count(r) as contradictions
      `);

      const counts = countsResult.records[0];
      const totalDocuments = counts.get('docs').toNumber();
      const totalClaims = counts.get('claims').toNumber();
      const totalContradictions = counts.get('contradictions').toNumber();

      // Find contradiction chains
      const contradictionChains = await this.findContradictionChains();

      // Analyze temporal patterns
      const temporalResult = await session.run(`
        MATCH (d1:Document)-[:CONTAINS]->(c1:Claim)-[r:CONTRADICTS]->(c2:Claim)<-[:CONTAINS]-(d2:Document)
        WHERE d1.date < d2.date
        WITH d1.type + ' -> ' + d2.type as pattern, 
             count(r) as frequency,
             avg(r.severity) as avg_severity,
             collect(DISTINCT d1.id + ',' + d2.id) as doc_pairs
        RETURN pattern, frequency, avg_severity, doc_pairs
        ORDER BY frequency DESC
        LIMIT 10
      `);

      const temporalPatterns = temporalResult.records.map(record => ({
        pattern: record.get('pattern'),
        frequency: record.get('frequency').toNumber(),
        severity: record.get('avg_severity'),
        documents: record.get('doc_pairs')
      }));

      // Analyze entity network
      const entityResult = await session.run(`
        MATCH (e:Entity)<-[:MENTIONS]-(c:Claim)
        OPTIONAL MATCH (c)-[:CONTRADICTS]->()
        WITH e, count(DISTINCT c) as connections, count(DISTINCT c) as contradictions
        RETURN e.name as entity, 
               e.type as type,
               connections,
               contradictions,
               contradictions * 10 as risk_score
        ORDER BY risk_score DESC
        LIMIT 20
      `);

      const entityNetwork = entityResult.records.map(record => ({
        entity: record.get('entity'),
        connections: record.get('connections').toNumber(),
        contradictionCount: record.get('contradictions').toNumber(),
        riskScore: record.get('risk_score').toNumber()
      }));

      return {
        totalDocuments,
        totalClaims,
        totalContradictions,
        contradictionChains,
        temporalPatterns,
        entityNetwork
      };

    } finally {
      await session.close();
    }
  }

  /**
   * Generate D3.js visualization data for the contradiction network
   */
  async generateVisualizationData(): Promise<{
    nodes: Array<{ id: string; type: string; label: string; size: number; color: string }>;
    links: Array<{ source: string; target: string; strength: number; type: string }>;
  }> {
    const session = this.driver.session();
    
    try {
      const result = await session.run(`
        MATCH (d:Document)-[:CONTAINS]->(c:Claim)
        OPTIONAL MATCH (c)-[r:CONTRADICTS]->(c2:Claim)<-[:CONTAINS]-(d2:Document)
        RETURN d.id as doc_id, d.type as doc_type, d.title as doc_title,
               c.id as claim_id, c.type as claim_type,
               c2.id as target_claim_id, 
               r.confidence as contradiction_confidence,
               d2.id as target_doc_id
        LIMIT 500
      `);

      const nodes: Array<{ id: string; type: string; label: string; size: number; color: string }> = [];
      const links: Array<{ source: string; target: string; strength: number; type: string }> = [];
      const nodeMap = new Map<string, boolean>();

      result.records.forEach(record => {
        const docId = record.get('doc_id');
        const docType = record.get('doc_type');
        const docTitle = record.get('doc_title');
        const claimId = record.get('claim_id');
        const targetClaimId = record.get('target_claim_id');
        const confidence = record.get('contradiction_confidence');

        // Add document node
        if (!nodeMap.has(docId)) {
          nodes.push({
            id: docId,
            type: 'document',
            label: docTitle.substring(0, 30),
            size: 20,
            color: docType === 'SEC_FILING' ? '#ff6b6b' : '#4ecdc4'
          });
          nodeMap.set(docId, true);
        }

        // Add claim node
        if (!nodeMap.has(claimId)) {
          nodes.push({
            id: claimId,
            type: 'claim',
            label: 'Claim',
            size: 10,
            color: '#95e1d3'
          });
          nodeMap.set(claimId, true);
        }

        // Add contradiction link if exists
        if (targetClaimId && confidence) {
          links.push({
            source: claimId,
            target: targetClaimId,
            strength: confidence,
            type: 'contradiction'
          });
        }
      });

      return { nodes, links };

    } finally {
      await session.close();
    }
  }

  /**
   * Close the Neo4j driver connection
   */
  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      console.log('🔗 Neo4j connection closed');
    }
  }

  /**
   * Clear all data from the knowledge graph
   */
  async clearGraph(): Promise<void> {
    const session = this.driver.session();
    
    try {
      await session.run('MATCH (n) DETACH DELETE n');
      console.log('✅ Knowledge graph cleared');
    } finally {
      await session.close();
    }
  }
}