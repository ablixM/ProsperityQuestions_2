import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Player {
  id: string;
  name: string;
  profileImage: string; // base64 encoded image or URL
  woreda: string; // formatted as "01", "02", etc.
  questionsAnswered: number[];
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
}

interface GameState {
  players: Player[];
  currentPlayerId: string | null;
  completedNumbers: number[];
  questionAnswers: Record<number, number>;
  totalQuestions: number;
  tieBreakers: number[]; // Track which questions are tie breakers

  // Player management
  addPlayer: (name: string, profileImage: string, woreda: string) => void;
  removePlayer: (id: string) => void;
  setCurrentPlayer: (id: string | null) => void;
  getCurrentPlayer: () => Player | null;
  getPlayerRankings: () => Player[];

  // Game actions
  markQuestionAsCompleted: (
    questionNumber: number,
    answerIndex: number,
    isCorrect: boolean
  ) => void;
  resetGame: () => void;
  isQuestionCompleted: (questionNumber: number) => boolean;
  isQuestionCompletedByPlayer: (
    playerId: string,
    questionNumber: number
  ) => boolean;
  getCorrectAnswerIndex: (questionNumber: number) => number | null;
  getAvailableQuestionsForCurrentPlayer: () => number[];
  getQuestionsPerPlayer: () => number;
  getMaxQuestionsPerPlayer: () => number;
  isTieBreakerQuestion: (questionNumber: number) => boolean;
  recalculateTieBreakers: () => void;
  hasPlayerReachedMaxQuestions: (playerId: string) => boolean;
}

// Using persist middleware to save game state to localStorage
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      players: [],
      currentPlayerId: null,
      completedNumbers: [],
      questionAnswers: {},
      totalQuestions: 60, // Updated to match the total number of questions in questions.ts
      tieBreakers: [],

      addPlayer: (
        name: string,
        profileImage: string = "",
        woreda: string = ""
      ) => {
        const id = Date.now().toString();
        set((state) => {
          const newPlayers = [
            ...state.players,
            {
              id,
              name,
              profileImage,
              woreda,
              questionsAnswered: [],
              correctAnswers: 0,
              incorrectAnswers: 0,
              score: 0,
            },
          ];

          return {
            players: newPlayers,
          };
        });

        // Recalculate tie breakers when players change
        get().recalculateTieBreakers();
      },

      removePlayer: (id: string) => {
        set((state) => {
          const newState = {
            players: state.players.filter((player) => player.id !== id),
            currentPlayerId:
              state.currentPlayerId === id ? null : state.currentPlayerId,
          };
          return newState;
        });

        // Recalculate tie breakers when players change
        get().recalculateTieBreakers();
      },

      setCurrentPlayer: (id: string | null) => {
        set({ currentPlayerId: id });
      },

      getCurrentPlayer: () => {
        const currentPlayerId = get().currentPlayerId;
        return currentPlayerId
          ? get().players.find((player) => player.id === currentPlayerId) ||
              null
          : null;
      },

      getPlayerRankings: () => {
        return [...get().players].sort((a, b) => b.score - a.score);
      },

      markQuestionAsCompleted: (
        questionNumber: number,
        answerIndex: number,
        isCorrect: boolean
      ) => {
        const currentPlayer = get().getCurrentPlayer();

        set((state) => {
          // Update global completed questions
          const newCompletedNumbers = state.completedNumbers.includes(
            questionNumber
          )
            ? state.completedNumbers
            : [...state.completedNumbers, questionNumber];

          // Update question answers record
          const newQuestionAnswers = {
            ...state.questionAnswers,
            [questionNumber]: answerIndex,
          };

          // Update player stats if we have a current player
          let updatedPlayers = [...state.players];
          if (currentPlayer) {
            updatedPlayers = state.players.map((player) => {
              if (player.id === currentPlayer.id) {
                // Check if this question is already in the player's answered questions
                const alreadyAnswered =
                  player.questionsAnswered.includes(questionNumber);

                // If the question is already answered, we don't update the score again
                // This prevents a correct answer after a wrong one from updating the score
                if (alreadyAnswered) {
                  return player;
                }

                const newQuestionsAnswered = [
                  ...player.questionsAnswered,
                  questionNumber,
                ];

                return {
                  ...player,
                  questionsAnswered: newQuestionsAnswered,
                  correctAnswers: isCorrect
                    ? player.correctAnswers + 1
                    : player.correctAnswers,
                  incorrectAnswers: !isCorrect
                    ? player.incorrectAnswers + 1
                    : player.incorrectAnswers,
                  score: isCorrect ? player.score + 10 : player.score,
                };
              }
              return player;
            });
          }

          return {
            completedNumbers: newCompletedNumbers,
            questionAnswers: newQuestionAnswers,
            players: updatedPlayers,
          };
        });
      },

      resetGame: () => {
        set({
          players: [],
          currentPlayerId: null,
          completedNumbers: [],
          questionAnswers: {},
          tieBreakers: [],
        });
      },

      isQuestionCompleted: (questionNumber: number) => {
        return get().completedNumbers.includes(questionNumber);
      },

      isQuestionCompletedByPlayer: (
        playerId: string,
        questionNumber: number
      ) => {
        const player = get().players.find((p) => p.id === playerId);
        return player
          ? player.questionsAnswered.includes(questionNumber)
          : false;
      },

      getCorrectAnswerIndex: (questionNumber: number) => {
        return get().questionAnswers[questionNumber] ?? null;
      },

      getAvailableQuestionsForCurrentPlayer: () => {
        const currentPlayer = get().getCurrentPlayer();
        if (!currentPlayer) return [];

        // Get all question numbers (1 to totalQuestions)
        const allQuestions = Array.from(
          { length: get().totalQuestions },
          (_, i) => i + 1
        );

        // Filter out questions that are already answered
        const unansweredQuestions = allQuestions.filter(
          (qNum) => !get().completedNumbers.includes(qNum)
        );

        // Check if player has reached their max questions
        if (get().hasPlayerReachedMaxQuestions(currentPlayer.id)) {
          // If player has reached max, they can only answer tie breaker questions
          return unansweredQuestions.filter((qNum) =>
            get().isTieBreakerQuestion(qNum)
          );
        }

        // If player hasn't reached max, they can answer any unanswered question
        return unansweredQuestions;
      },

      getQuestionsPerPlayer: () => {
        const playerCount = get().players.length;
        if (playerCount === 0) return 0;

        return Math.ceil(get().totalQuestions / playerCount);
      },

      getMaxQuestionsPerPlayer: () => {
        const playerCount = get().players.length;
        if (playerCount === 0) return 0;

        // Each player can answer at most floor(totalQuestions / playerCount) questions
        return Math.floor(get().totalQuestions / playerCount);
      },

      isTieBreakerQuestion: (questionNumber: number) => {
        return get().tieBreakers.includes(questionNumber);
      },

      recalculateTieBreakers: () => {
        const totalQuestions = get().totalQuestions;
        const playerCount = get().players.length;

        if (playerCount === 0) {
          set({ tieBreakers: [] });
          return;
        }

        const remainingQuestions = totalQuestions % playerCount;

        // The last 'remainingQuestions' are tie breakers
        const tieBreakers = Array.from(
          { length: remainingQuestions },
          (_, i) => totalQuestions - i
        );

        set({ tieBreakers });
      },

      hasPlayerReachedMaxQuestions: (playerId: string) => {
        const player = get().players.find((p) => p.id === playerId);
        if (!player) return false;

        const maxQuestionsPerPlayer = get().getMaxQuestionsPerPlayer();

        // Count non-tie breaker questions the player has answered
        const regularQuestionsAnswered = player.questionsAnswered.filter(
          (qNum) => !get().isTieBreakerQuestion(qNum)
        ).length;

        return regularQuestionsAnswered >= maxQuestionsPerPlayer;
      },
    }),
    {
      name: "quiz-game-storage", // unique name for localStorage
    }
  )
);
