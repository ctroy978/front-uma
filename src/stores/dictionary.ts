// src/stores/dictionary.ts
import { defineStore } from 'pinia'
import axios from 'axios'

interface Definition {
  definition: string
  example?: string
  synonyms?: string[]
  antonyms?: string[]
}

interface Meaning {
  partOfSpeech: string
  definitions: Definition[]
  synonyms?: string[]
  antonyms?: string[]
}

interface Phonetic {
  text: string
  audio?: string
}

interface WordDefinition {
  word: string
  phonetic?: string
  phonetics?: Phonetic[]
  meanings: Meaning[]
  sourceUrls?: string[]
}

export const useDictionaryStore = defineStore('dictionary', {
  state: () => ({
    selectedWord: null as string | null,
    wordData: null as WordDefinition | null,
    isLoading: false,
    error: null as string | null
  }),

  actions: {
    setSelectedWord(word: string) {
      // If a word is already selected and it's the same word, just return
      if (this.selectedWord === word) return
      
      // Clean up the word (remove punctuation, etc.)
      const cleanWord = word.replace(/[^a-zA-Z]/g, '').toLowerCase()
      
      if (!cleanWord) return
      
      this.selectedWord = cleanWord
      this.lookupWord(cleanWord)
    },

    clearSelectedWord() {
      this.selectedWord = null
      this.wordData = null
      this.error = null
    },

    async lookupWord(word: string) {
      if (!word) return
      
      this.isLoading = true
      this.error = null
      this.wordData = null
      
      try {
        // Use free Dictionary API
        const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        
        if (response.data && response.data.length > 0) {
          // The API returns an array, but we only need the first entry
          this.wordData = response.data[0]
        } else {
          throw new Error('No definition found')
        }
      } catch (error: any) {
        if (error.response && error.response.status === 404) {
          this.error = `No definition found for "${word}"`
        } else {
          this.error = 'Error looking up word. Please try again.'
          console.error('Dictionary lookup error:', error)
        }
      } finally {
        this.isLoading = false
      }
    }
  }
})