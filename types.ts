
export type ProficiencyLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type LearningGoal = 'Conversation' | 'Business' | 'Travel' | 'Exams';

export interface UserProfile {
  name: string;
  level: ProficiencyLevel;
  goal: LearningGoal;
}

export interface Correction {
  original: string;
  corrected: string;
  explanation: string;
  alternative?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  correction?: Correction;
}

export interface SessionStats {
  messagesCount: number;
  correctionsCount: number;
  commonMistakes: string[];
}
