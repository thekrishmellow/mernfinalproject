import pdfParse from 'pdf-parse';

export class DocumentExtractionService {
  /**
   * Extracts raw text from buffer based on MIME type or extension
   */
  static async extractTextFromBuffer(buffer, mimeType = '', filename = '') {
    if (mimeType.includes('pdf') || filename.endsWith('.pdf')) {
      try {
        const pdfData = await pdfParse(buffer);
        if (!pdfData.text || pdfData.text.trim().length === 0) {
          throw new Error('PDF appears to be scanned or contains no extractable text. OCR required.');
        }
        return pdfData.text;
      } catch (err) {
        throw new Error(`PDF text extraction error: ${err.message}`);
      }
    }

    // Markdown or plain text
    return buffer.toString('utf-8');
  }

  /**
   * Parses raw text into candidate questions with prompts, choices, and detected answer keys
   */
  static parseQuestionsFromText(rawText) {
    if (!rawText || !rawText.trim()) {
      return [];
    }

    // Split text into potential question blocks
    // Matches patterns like "1.", "Question 1:", "Q1.", "1)" at the start of a line
    const lines = rawText.split(/\r?\n/);
    const blocks = [];
    let currentBlock = [];

    const questionStartRegex = /^(?:Question\s*\d+[:.]?|Q\d+[:.]?|\d+[\.\)])\s+/i;

    for (const line of lines) {
      const trimmed = line.trim();
      if (questionStartRegex.test(trimmed)) {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock.join('\n'));
          currentBlock = [];
        }
      }
      if (trimmed.length > 0 || currentBlock.length > 0) {
        currentBlock.push(line);
      }
    }

    if (currentBlock.length > 0) {
      blocks.push(currentBlock.join('\n'));
    }

    const parsedQuestions = [];

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i].trim();
      const questionData = this.parseSingleQuestionBlock(block, i + 1);
      if (questionData) {
        parsedQuestions.push(questionData);
      }
    }

    return parsedQuestions;
  }

  static parseSingleQuestionBlock(block, index) {
    const lines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return null;

    let prompt = '';
    const options = [];
    let correctAnswers = [];
    let explanation = '';
    let confidence = 'high';
    const notes = [];

    // Extract prompt from top line(s) before options start
    const optionRegex = /^([A-Da-d]|[1-4])[\.\)\:\-]\s*(.*)$/;
    const answerRegex = /^(?:Answer|Ans|Correct(?:\s*Answer)?)\s*[:\-\=]\s*([A-Da-d1-4\s\,]+)/i;
    const explanationRegex = /^(?:Explanation|Reason|Note)\s*[:\-\=]\s*(.*)$/i;

    let inOptions = false;

    for (let j = 0; j < lines.length; j++) {
      const line = lines[j];

      // Check for Answer key line
      const ansMatch = line.match(answerRegex);
      if (ansMatch) {
        const rawAns = ansMatch[1].trim().toUpperCase();
        correctAnswers = rawAns.split(/[\s,]+/).filter(Boolean);
        continue;
      }

      // Check for Explanation line
      const expMatch = line.match(explanationRegex);
      if (expMatch) {
        explanation = expMatch[1].trim();
        continue;
      }

      // Check for Option line (A., B., C., D.)
      const optMatch = line.match(optionRegex);
      if (optMatch) {
        inOptions = true;
        const letter = optMatch[1].toUpperCase();
        const text = optMatch[2].trim();
        options.push({
          id: letter,
          text: text || `Option ${letter}`
        });
        continue;
      }

      if (!inOptions) {
        // Still part of the prompt
        // Remove leading "1. " or "Q1: "
        const cleanedLine = j === 0 ? line.replace(/^(?:Question\s*\d+[:.]?|Q\d+[:.]?|\d+[\.\)])\s+/i, '') : line;
        prompt = prompt ? `${prompt} ${cleanedLine}` : cleanedLine;
      } else {
        // Maybe continuation of previous option or explanation
        if (options.length > 0 && !explanation) {
          options[options.length - 1].text += ` ${line}`;
        }
      }
    }

    if (!prompt) {
      prompt = `Question ${index}`;
    }

    // Validation & confidence checks
    if (options.length < 2) {
      confidence = 'low';
      notes.push('Fewer than 2 options were detected. Review needed.');
    }

    if (correctAnswers.length === 0) {
      confidence = 'review_required';
      notes.push('No correct answer key detected. Administrator must assign the correct answer.');
      // Fallback default first option for safe editing
      correctAnswers = options.length > 0 ? [options[0].id] : ['A'];
    }

    return {
      id: `ext_q_${index}_${Date.now()}`,
      prompt,
      type: 'single_choice',
      options: options.length > 0 ? options : [
        { id: 'A', text: 'Option A' },
        { id: 'B', text: 'Option B' }
      ],
      correctAnswers,
      explanation,
      difficulty: 'medium',
      confidence,
      reviewNotes: notes
    };
  }
}
