import { query } from '../config/database';
import { Question, Category, QuestionDifficulty, QuestionMetadata } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class QuestionModel {
  /**
   * Create a new question
   */
  static async create(
    categoryId: string,
    industryPack: string,
    round: number,
    pointValue: number,
    questionText: string,
    correctAnswer: string,
    distractors: string[],
    explanation: string,
    difficulty: QuestionDifficulty,
    learningOutcome: string,
    complianceReference?: string,
    metadata?: QuestionMetadata
  ): Promise<Question> {
    const id = uuidv4();
    const sql = `
      INSERT INTO questions (
        id, category_id, industry_pack, round, point_value,
        question_text, correct_answer, distractors, explanation,
        compliance_reference, difficulty, learning_outcome, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `;

    const questions = await query<Question>(sql, [
      id,
      categoryId,
      industryPack,
      round,
      pointValue,
      questionText,
      correctAnswer,
      JSON.stringify(distractors),
      explanation,
      complianceReference,
      difficulty,
      learningOutcome,
      JSON.stringify(metadata || {}),
    ]);

    const question = questions[0];
    question.distractors = Array.isArray(question.distractors)
      ? question.distractors
      : JSON.parse(question.distractors as unknown as string);
    question.metadata = typeof question.metadata === 'string'
      ? JSON.parse(question.metadata as unknown as string)
      : question.metadata;

    return question;
  }

  /**
   * Find question by ID
   */
  static async findById(id: string): Promise<Question | null> {
    const sql = 'SELECT * FROM questions WHERE id = $1';
    const questions = await query<Question>(sql, [id]);

    if (questions[0]) {
      questions[0].distractors = Array.isArray(questions[0].distractors)
        ? questions[0].distractors
        : JSON.parse(questions[0].distractors as unknown as string);
      questions[0].metadata = typeof questions[0].metadata === 'string'
        ? JSON.parse(questions[0].metadata as unknown as string)
        : questions[0].metadata;
    }

    return questions[0] || null;
  }

  /**
   * Find questions by category
   */
  static async findByCategory(categoryId: string): Promise<Question[]> {
    const sql = 'SELECT * FROM questions WHERE category_id = $1 ORDER BY point_value ASC';
    const questions = await query<Question>(sql, [categoryId]);

    return questions.map(q => ({
      ...q,
      distractors: Array.isArray(q.distractors) ? q.distractors : JSON.parse(q.distractors as unknown as string),
      metadata: typeof q.metadata === 'string' ? JSON.parse(q.metadata as unknown as string) : q.metadata
    }));
  }

  /**
   * Find questions by industry pack and round
   */
  static async findByPackAndRound(
    industryPack: string,
    round: number
  ): Promise<Question[]> {
    const sql = `
      SELECT * FROM questions
      WHERE industry_pack = $1 AND round = $2
      ORDER BY category_id, point_value ASC
    `;
    const questions = await query<Question>(sql, [industryPack, round]);

    return questions.map(q => ({
      ...q,
      distractors: Array.isArray(q.distractors) ? q.distractors : JSON.parse(q.distractors as unknown as string),
      metadata: typeof q.metadata === 'string' ? JSON.parse(q.metadata as unknown as string) : q.metadata
    }));
  }

  /**
   * Delete question
   */
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM questions WHERE id = $1';
    await query(sql, [id]);
    return true;
  }
}

export class CategoryModel {
  /**
   * Create a new category
   */
  static async create(
    name: string,
    industryPack: string,
    round: number,
    description: string,
    orderPosition: number
  ): Promise<Category> {
    const id = uuidv4();
    const sql = `
      INSERT INTO categories (id, name, industry_pack, round, description, order_position)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const categories = await query<Category>(sql, [
      id,
      name,
      industryPack,
      round,
      description,
      orderPosition,
    ]);
    return categories[0];
  }

  /**
   * Find category by ID
   */
  static async findById(id: string): Promise<Category | null> {
    const sql = 'SELECT * FROM categories WHERE id = $1';
    const categories = await query<Category>(sql, [id]);
    return categories[0] || null;
  }

  /**
   * Find categories by industry pack and round
   */
  static async findByPackAndRound(
    industryPack: string,
    round: number
  ): Promise<Category[]> {
    const sql = `
      SELECT * FROM categories
      WHERE industry_pack = $1 AND round = $2
      ORDER BY order_position ASC
    `;
    return query<Category>(sql, [industryPack, round]);
  }

  /**
   * Delete category
   */
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM categories WHERE id = $1';
    await query(sql, [id]);
    return true;
  }
}
