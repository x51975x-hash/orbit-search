import { useState, useEffect } from 'react';
import { Result } from '../data/results';

interface Deck {
  id: string;
  name: string;
  cards: Result[];
}

export function useLibrary() {
  const [savedCards, setSavedCards] = useState<Result[]>(() => {
    const saved = localStorage.getItem('orbit_saved_cards');
    return saved ? JSON.parse(saved) : [];
  });

  const [decks, setDecks] = useState<Deck[]>(() => {
    const saved = localStorage.getItem('orbit_decks');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('orbit_saved_cards', JSON.stringify(savedCards));
  }, [savedCards]);

  useEffect(() => {
    localStorage.setItem('orbit_decks', JSON.stringify(decks));
  }, [decks]);

  const saveCard = (card: Result) => {
    setSavedCards((prev) => {
      if (!prev.find((c) => c.id === card.id)) {
        return [...prev, card];
      }
      return prev;
    });
  };

  const unsaveCard = (cardId: string) => {
    setSavedCards((prev) => prev.filter((c) => c.id !== cardId));
  };

  const createDeck = (deckName: string) => {
    const newDeck: Deck = { id: Date.now().toString(), name: deckName, cards: [] };
    setDecks((prev) => [...prev, newDeck]);
    return newDeck;
  };

  const addCardToDeck = (deckId: string, card: Result) => {
    setDecks((prevDecks) =>
      prevDecks.map((deck) => {
        if (deck.id === deckId && !deck.cards.find((c) => c.id === card.id)) {
          return { ...deck, cards: [...deck.cards, card] };
        }
        return deck;
      })
    );
  };

  const removeCardFromDeck = (deckId: string, cardId: string) => {
    setDecks((prevDecks) =>
      prevDecks.map((deck) => {
        if (deck.id === deckId) {
          return { ...deck, cards: deck.cards.filter((c) => c.id !== cardId) };
        }
        return deck;
      })
    );
  };

  const deleteDeck = (deckId: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
  };

  return {
    savedCards,
    decks,
    saveCard,
    unsaveCard,
    createDeck,
    addCardToDeck,
    removeCardFromDeck,
    deleteDeck,
  };
}
