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
  // Round management
  currentRound: 1 | 2;
  roundOneState: {
    players: Player[];
    completedNumbers: number[];
    questionAnswers: Record<number, number>;
    tieBreakers: number[];
  } | null;
  roundTwoPlayers: string[]; // Player IDs selected for round two

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

  // Round management
  startRoundTwo: (selectedPlayerIds: string[]) => void;
  switchToRound: (round: 1 | 2) => void;
  addPlayerToRoundTwo: (playerId: string) => void;
  removePlayerFromRoundTwo: (playerId: string) => void;
  getRoundTwoPlayers: () => Player[];
  getRoundOnePlayers: () => Player[];
  resetRoundTwo: () => void;

  // Game actions
  markQuestionAsCompleted: (
    questionNumber: number,
    answerIndex: number,
    isCorrect: boolean
  ) => void;
  revertQuestion: (playerId: string, questionNumber: number) => void;
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
      // Round management
      currentRound: 1,
      roundOneState: null,
      roundTwoPlayers: [],

      players: [],
      currentPlayerId: null,
      completedNumbers: [],
      questionAnswers: {},
      totalQuestions: 116, // Updated to match the total number of questions in questions.ts
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
          // Round management
          currentRound: 1,
          roundOneState: null,
          roundTwoPlayers: [],

          players: [],
          currentPlayerId: null,
          completedNumbers: [],
          questionAnswers: {},
          totalQuestions: 116, // Updated to match the total number of questions in questions.ts
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

        // Get available tiebreaker questions
        const availableTieBreakers = unansweredQuestions.filter((qNum) =>
          get().isTieBreakerQuestion(qNum)
        );

        // Check if player has reached their max questions
        if (get().hasPlayerReachedMaxQuestions(currentPlayer.id)) {
          // If player has reached max, they can only answer tie breaker questions
          return availableTieBreakers;
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

      revertQuestion: (playerId: string, questionNumber: number) => {
        set((state) => {
          // Find the player
          const playerIndex = state.players.findIndex((p) => p.id === playerId);
          if (playerIndex === -1) return state;

          const player = state.players[playerIndex];

          // Check if the player has answered this question
          const questionIndex =
            player.questionsAnswered.indexOf(questionNumber);
          if (questionIndex === -1) return state;

          // Determine if the answer was correct based on the index
          const isCorrect = player.correctAnswers > questionIndex;

          // Remove the question from player's answered questions
          const newQuestionsAnswered = player.questionsAnswered.filter(
            (q) => q !== questionNumber
          );

          // Update player stats
          const newCorrectAnswers = isCorrect
            ? player.correctAnswers - 1
            : player.correctAnswers;
          const newIncorrectAnswers = isCorrect
            ? player.incorrectAnswers
            : player.incorrectAnswers - 1;
          const newScore = isCorrect ? player.score - 10 : player.score;

          // Keep the question as completed globally - don't make it available again
          const newCompletedNumbers = state.completedNumbers;

          // Keep the question answers record - don't remove it
          const newQuestionAnswers = state.questionAnswers;

          // Update player
          const updatedPlayer = {
            ...player,
            questionsAnswered: newQuestionsAnswered,
            correctAnswers: newCorrectAnswers,
            incorrectAnswers: newIncorrectAnswers,
            score: newScore,
          };

          const newPlayers = [...state.players];
          newPlayers[playerIndex] = updatedPlayer;

          return {
            players: newPlayers,
            completedNumbers: newCompletedNumbers,
            questionAnswers: newQuestionAnswers,
          };
        });

        // Recalculate tie breakers when questions are reverted
        get().recalculateTieBreakers();
      },

      startRoundTwo: (selectedPlayerIds: string[]) => {
        set((state) => {
          // Save current round one state if not already saved
          const roundOneState = state.roundOneState || {
            players: [...state.players],
            completedNumbers: [...state.completedNumbers],
            questionAnswers: { ...state.questionAnswers },
            tieBreakers: [...state.tieBreakers],
          };

          // Filter players for round two from the original round one players
          const roundTwoPlayers = roundOneState.players.filter((player) =>
            selectedPlayerIds.includes(player.id)
          );

          return {
            currentRound: 2,
            roundOneState,
            roundTwoPlayers: selectedPlayerIds,
            players: roundTwoPlayers,
            currentPlayerId: null,
            completedNumbers: [],
            questionAnswers: {},
            tieBreakers: [],
          };
        });

        // Recalculate tie breakers for round two
        get().recalculateTieBreakers();
      },

      switchToRound: (round: 1 | 2) => {
        set((state) => {
          if (round === 1 && state.roundOneState) {
            return {
              currentRound: 1,
              players: [...state.roundOneState.players],
              currentPlayerId: null,
              completedNumbers: [...state.roundOneState.completedNumbers],
              questionAnswers: { ...state.roundOneState.questionAnswers },
              tieBreakers: [...state.roundOneState.tieBreakers],
            };
          } else if (round === 2) {
            const roundTwoPlayers =
              state.roundOneState?.players.filter((player) =>
                state.roundTwoPlayers.includes(player.id)
              ) || [];

            return {
              currentRound: 2,
              players: roundTwoPlayers,
              currentPlayerId: null,
            };
          }
          return state;
        });

        // Recalculate tie breakers when switching rounds
        get().recalculateTieBreakers();
      },

      addPlayerToRoundTwo: (playerId: string) => {
        set((state) => ({
          roundTwoPlayers: state.roundTwoPlayers.includes(playerId)
            ? state.roundTwoPlayers
            : [...state.roundTwoPlayers, playerId],
        }));
      },

      removePlayerFromRoundTwo: (playerId: string) => {
        set((state) => ({
          roundTwoPlayers: state.roundTwoPlayers.filter(
            (id) => id !== playerId
          ),
        }));
      },

      getRoundTwoPlayers: () => {
        const state = get();
        if (!state.roundOneState) return [];

        return state.roundOneState.players.filter((player) =>
          state.roundTwoPlayers.includes(player.id)
        );
      },

      getRoundOnePlayers: () => {
        const state = get();
        return state.roundOneState?.players || [];
      },

      resetRoundTwo: () => {
        set((state) => ({
          currentRound: 1,
          roundOneState: null,
          roundTwoPlayers: [],
          players: state.roundOneState?.players || [],
          currentPlayerId: null,
          completedNumbers: state.roundOneState?.completedNumbers || [],
          questionAnswers: state.roundOneState?.questionAnswers || {},
          tieBreakers: state.roundOneState?.tieBreakers || [],
        }));

        // Recalculate tie breakers
        get().recalculateTieBreakers();
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
