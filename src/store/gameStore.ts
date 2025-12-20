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
  currentRound: 1 | 2 | 3;
  roundOneState: {
    players: Player[];
    completedNumbers: number[];
    questionAnswers: Record<number, number>;
    tieBreakers: number[];
  } | null;
  roundTwoState: {
    players: Player[];
    completedNumbers: number[];
    questionAnswers: Record<number, number>;
    tieBreakers: number[];
  } | null;
  roundThreeState: {
    players: Player[];
    completedNumbers: number[];
    questionAnswers: Record<number, number>;
    tieBreakers: number[];
  } | null;
  roundTwoPlayers: string[]; // Player IDs selected for round two
  roundThreePlayers: string[]; // Player IDs selected for round three

  players: Player[];
  currentPlayerId: string | null;
  completedNumbers: number[];
  questionAnswers: Record<number, number>;
  totalQuestions: number;
  tieBreakers: number[]; // Track which questions are tie breakers
  activeQuestionType: "choice" | "explanation";

  // Player management
  addPlayer: (name: string, profileImage: string, woreda: string) => void;
  removePlayer: (id: string) => void;
  setCurrentPlayer: (id: string | null) => void;
  getCurrentPlayer: () => Player | null;
  getPlayerRankings: () => Player[];
  setActiveQuestionType: (type: "choice" | "explanation") => void;

  // Round management
  startRoundTwo: (selectedPlayerIds: string[]) => void;
  startRoundThree: (selectedPlayerIds: string[]) => void;
  switchToRound: (round: 1 | 2 | 3) => void;
  addPlayerToRoundTwo: (playerId: string) => void;
  removePlayerFromRoundTwo: (playerId: string) => void;
  getRoundTwoPlayers: () => Player[];
  getRoundOnePlayers: () => Player[];
  resetRoundTwo: () => void;
  addPlayerToRoundThree: (playerId: string) => void;
  removePlayerFromRoundThree: (playerId: string) => void;
  getRoundThreePlayers: () => Player[];
  resetRoundThree: () => void;

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
  getAllCompletedNumbers: () => number[]; // Get all completed numbers including previous rounds
  getCurrentRoundCompletedNumbers: () => number[]; // Get only current round's completed numbers
}

// Using persist middleware to save game state to localStorage
export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Round management
      currentRound: 1,
      roundOneState: null,
      roundTwoState: null,
      roundThreeState: null,
      roundTwoPlayers: [],
      roundThreePlayers: [],

      players: [],
      currentPlayerId: null,
      completedNumbers: [],
      questionAnswers: {},
      totalQuestions: 127, // Updated to match the total number of questions in questions.ts
      tieBreakers: [],
      activeQuestionType: "choice",

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

      setActiveQuestionType: (type: "choice" | "explanation") => {
        set({ activeQuestionType: type });
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
          roundTwoState: null,
          roundThreeState: null,
          roundTwoPlayers: [],
          roundThreePlayers: [],

          players: [],
          currentPlayerId: null,
          completedNumbers: [],
          questionAnswers: {},
          totalQuestions: 127, // Updated to match the total number of questions in questions.ts
          tieBreakers: [],
          activeQuestionType: "choice",
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

        // Get all completed numbers including from previous rounds
        const allCompletedNumbers = get().getAllCompletedNumbers();

        // Filter out questions that are already answered (in any round)
        const unansweredQuestions = allQuestions.filter(
          (qNum) => !allCompletedNumbers.includes(qNum)
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

      getAllCompletedNumbers: () => {
        const state = get();

        // Merge completed numbers from all rounds
        const roundOneCompleted = state.roundOneState?.completedNumbers || [];
        const roundTwoCompleted = state.roundTwoState?.completedNumbers || [];
        const roundThreeCompleted =
          state.roundThreeState?.completedNumbers || [];
        const currentCompleted = state.completedNumbers || [];

        // If we're in Round 1 and Round 2 state exists, merge Round 2's completed
        // If we're in Round 2 and Round 1 state exists, merge Round 1's completed
        // This ensures questions answered in one round are hidden in the other
        if (state.currentRound === 1) {
          // In Round 1, merge with Round 2 and 3 completed numbers
          return Array.from(
            new Set([
              ...currentCompleted,
              ...roundTwoCompleted,
              ...roundThreeCompleted,
            ])
          );
        } else if (state.currentRound === 2) {
          // In Round 2, merge with Round 1 and 3 completed numbers
          return Array.from(
            new Set([
              ...currentCompleted,
              ...roundOneCompleted,
              ...roundThreeCompleted,
            ])
          );
        } else if (state.currentRound === 3) {
          // In Round 3, merge with Round 1 and 2 completed numbers
          return Array.from(
            new Set([
              ...currentCompleted,
              ...roundOneCompleted,
              ...roundTwoCompleted,
            ])
          );
        }

        // Otherwise, just return current round's completed numbers
        return currentCompleted;
      },

      getCurrentRoundCompletedNumbers: () => {
        const state = get();
        // Always return only the current round's completed numbers
        return state.completedNumbers || [];
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

      startRoundThree: (selectedPlayerIds: string[]) => {
        set((state) => {
          // Save current round two state if not already saved
          const roundTwoState = state.roundTwoState || {
            players: [...state.players],
            completedNumbers: [...state.completedNumbers],
            questionAnswers: { ...state.questionAnswers },
            tieBreakers: [...state.tieBreakers],
          };

          // Filter players for round three from the original round two players
          const roundThreePlayers = roundTwoState.players.filter((player) =>
            selectedPlayerIds.includes(player.id)
          );

          return {
            currentRound: 3,
            roundTwoState,
            roundThreePlayers: selectedPlayerIds,
            players: roundThreePlayers,
            currentPlayerId: null,
            completedNumbers: [],
            questionAnswers: {},
            tieBreakers: [],
          };
        });

        // Recalculate tie breakers for round three
        get().recalculateTieBreakers();
      },

      switchToRound: (round: 1 | 2 | 3) => {
        set((state) => {
          if (round === 1 && state.roundOneState) {
            // Save current Round 2 state before switching to Round 1
            const roundTwoState =
              state.currentRound === 2
                ? {
                    players: [...state.players],
                    completedNumbers: [...state.completedNumbers],
                    questionAnswers: { ...state.questionAnswers },
                    tieBreakers: [...state.tieBreakers],
                  }
                : state.currentRound === 3 && state.roundThreeState
                ? state.roundTwoState
                : state.roundTwoState;
            const roundThreeState =
              state.currentRound === 3
                ? {
                    players: [...state.players],
                    completedNumbers: [...state.completedNumbers],
                    questionAnswers: { ...state.questionAnswers },
                    tieBreakers: [...state.tieBreakers],
                  }
                : state.roundThreeState;

            return {
              currentRound: 1,
              roundTwoState,
              roundThreeState,
              players: [...state.roundOneState.players],
              currentPlayerId: null,
              completedNumbers: [...state.roundOneState.completedNumbers],
              questionAnswers: { ...state.roundOneState.questionAnswers },
              tieBreakers: [...state.roundOneState.tieBreakers],
            };
          } else if (round === 2) {
            // Save current Round 1 state if we're coming from Round 1
            const roundOneState =
              state.currentRound === 1
                ? {
                    players: [...state.players],
                    completedNumbers: [...state.completedNumbers],
                    questionAnswers: { ...state.questionAnswers },
                    tieBreakers: [...state.tieBreakers],
                  }
                : state.roundOneState;

            // Restore Round 2 state if it exists, otherwise use current state
            if (state.roundTwoState) {
              return {
                currentRound: 2,
                roundOneState,
                players: [...state.roundTwoState.players],
                currentPlayerId: null,
                completedNumbers: [...state.roundTwoState.completedNumbers],
                questionAnswers: { ...state.roundTwoState.questionAnswers },
                tieBreakers: [...state.roundTwoState.tieBreakers],
              };
            } else {
              // First time switching to Round 2, use current players
              const roundTwoPlayers =
                state.roundOneState?.players.filter((player) =>
                  state.roundTwoPlayers.includes(player.id)
                ) || [];

              return {
                currentRound: 2,
                roundOneState,
                players: roundTwoPlayers,
                currentPlayerId: null,
              };
            }
          } else if (round === 3) {
            // Save current Round 2 state if we're coming from Round 2
            const roundTwoState =
              state.currentRound === 2
                ? {
                    players: [...state.players],
                    completedNumbers: [...state.completedNumbers],
                    questionAnswers: { ...state.questionAnswers },
                    tieBreakers: [...state.tieBreakers],
                  }
                : state.roundTwoState;

            // Restore Round 3 state if it exists, otherwise derive from round two selection
            if (state.roundThreeState) {
              return {
                currentRound: 3,
                roundTwoState,
                players: [...state.roundThreeState.players],
                currentPlayerId: null,
                completedNumbers: [...state.roundThreeState.completedNumbers],
                questionAnswers: { ...state.roundThreeState.questionAnswers },
                tieBreakers: [...state.roundThreeState.tieBreakers],
              };
            } else {
              // First time switching to Round 3, use players selected for round three
              const roundThreePlayers =
                state.roundTwoState?.players.filter((player) =>
                  state.roundThreePlayers.includes(player.id)
                ) || [];

              return {
                currentRound: 3,
                roundTwoState,
                players: roundThreePlayers,
                currentPlayerId: null,
              };
            }
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
          roundTwoState: null,
          roundTwoPlayers: [],
          roundThreeState: null,
          roundThreePlayers: [],
          players: state.roundOneState?.players || [],
          currentPlayerId: null,
          completedNumbers: state.roundOneState?.completedNumbers || [],
          questionAnswers: state.roundOneState?.questionAnswers || {},
          tieBreakers: state.roundOneState?.tieBreakers || [],
        }));

        // Recalculate tie breakers
        get().recalculateTieBreakers();
      },

      addPlayerToRoundThree: (playerId: string) => {
        set((state) => ({
          roundThreePlayers: state.roundThreePlayers.includes(playerId)
            ? state.roundThreePlayers
            : [...state.roundThreePlayers, playerId],
        }));
      },

      removePlayerFromRoundThree: (playerId: string) => {
        set((state) => ({
          roundThreePlayers: state.roundThreePlayers.filter(
            (id) => id !== playerId
          ),
        }));
      },

      getRoundThreePlayers: () => {
        const state = get();
        if (!state.roundTwoState) return [];
        return state.roundTwoState.players.filter((player) =>
          state.roundThreePlayers.includes(player.id)
        );
      },

      resetRoundThree: () => {
        set((state) => ({
          currentRound: 2,
          roundThreeState: null,
          roundThreePlayers: [],
          // restore round two state if available, otherwise keep current
          players: state.roundTwoState?.players || state.players,
          currentPlayerId: null,
          completedNumbers: state.roundTwoState?.completedNumbers || [],
          questionAnswers: state.roundTwoState?.questionAnswers || {},
          tieBreakers: state.roundTwoState?.tieBreakers || [],
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
