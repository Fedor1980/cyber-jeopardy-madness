/**
 * Question Pack Loader
 * Loads JSON question packs into the database
 */

import { Pool } from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { config } from '../backend/src/config/env';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
});

interface QuestionPack {
  industry_pack: string;
  name: string;
  description: string;
  rounds: {
    [key: string]: {
      categories: Array<{
        name: string;
        description: string;
        order_position: number;
      }>;
      questions: Array<{
        category: string;
        point_value: number;
        difficulty: string;
        question_text: string;
        correct_answer: string;
        distractors: string[];
        explanation: string;
        compliance_reference: string;
        learning_outcome: string;
        tags: string[];
      }>;
    };
  };
}

async function loadQuestionPack(filePath: string): Promise<void> {
  console.log(`Loading question pack: ${filePath}`);

  const fileContent = readFileSync(filePath, 'utf-8');
  const pack: QuestionPack = JSON.parse(fileContent);

  try {
    // Process each round
    for (const [roundKey, roundData] of Object.entries(pack.rounds)) {
      if (roundKey === 'final') continue; // Skip final jeopardy for now

      const roundNumber = parseInt(roundKey);

      // Insert categories
      for (const categoryData of roundData.categories) {
        const categoryId = uuidv4();

        await pool.query(
          `INSERT INTO categories (id, name, industry_pack, round, description, order_position)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT DO NOTHING`,
          [
            categoryId,
            categoryData.name,
            pack.industry_pack,
            roundNumber,
            categoryData.description,
            categoryData.order_position,
          ]
        );

        // Insert questions for this category
        const categoryQuestions = roundData.questions.filter(
          (q) => q.category === categoryData.name
        );

        for (const questionData of categoryQuestions) {
          const questionId = uuidv4();

          await pool.query(
            `INSERT INTO questions (
              id, category_id, industry_pack, round, point_value,
              question_text, correct_answer, distractors, explanation,
              compliance_reference, difficulty, learning_outcome, metadata
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            ON CONFLICT DO NOTHING`,
            [
              questionId,
              categoryId,
              pack.industry_pack,
              roundNumber,
              questionData.point_value,
              questionData.question_text,
              questionData.correct_answer,
              JSON.stringify(questionData.distractors),
              questionData.explanation,
              questionData.compliance_reference,
              questionData.difficulty,
              questionData.learning_outcome,
              JSON.stringify({ tags: questionData.tags, source: filePath }),
            ]
          );
        }
      }
    }

    console.log(`✓ Successfully loaded: ${pack.name}`);
  } catch (error) {
    console.error(`✗ Failed to load ${filePath}:`, error);
    throw error;
  }
}

async function loadAllPacks(): Promise<void> {
  console.log('Loading all question packs...\n');

  const packsDir = __dirname;
  const files = readdirSync(packsDir).filter(
    (f) => f.endsWith('.json') && !f.includes('package.json')
  );

  for (const file of files) {
    const filePath = join(packsDir, file);
    await loadQuestionPack(filePath);
  }

  console.log('\n✓ All question packs loaded successfully!');
  await pool.end();
}

loadAllPacks().catch((error) => {
  console.error('Failed to load question packs:', error);
  process.exit(1);
});
