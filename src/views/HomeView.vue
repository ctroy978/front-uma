<!-- src/views/HomeView.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-blue-50">
    <!-- Hero Section -->
    <div class="container mx-auto px-4 py-12">
      <div class="text-center mb-12">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Welcome to <span class="text-blue-600">uMa Reader</span>
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Your interactive reading companion that helps you understand and retain information better
          through AI-powered comprehension assistance.
        </p>
      </div>

      <!-- User Type Selection Tabs -->
      <div class="max-w-4xl mx-auto mb-8">
        <div class="flex border-b border-gray-200">
          <button 
            @click="activeTab = 'student'" 
            class="px-6 py-3 font-medium text-sm"
            :class="activeTab === 'student' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
          >
            I'm a Student
          </button>
          <button 
            @click="activeTab = 'teacher'" 
            class="px-6 py-3 font-medium text-sm"
            :class="activeTab === 'teacher' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'"
          >
            I'm a Teacher
          </button>
        </div>
      </div>

      <!-- Student Guide Section -->
      <div v-if="activeTab === 'student'" class="max-w-4xl mx-auto">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">How to Use uMa as a Student</h2>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Getting Started</h3>
            <ol class="list-decimal pl-5 space-y-3 text-gray-600">
              <li>Go to your <strong>Student Dashboard</strong> after logging in</li>
              <li>Select your <strong>teacher</strong> from the list</li>
              <li>Choose a <strong>text</strong> assigned by your teacher</li>
            </ol>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">During Reading</h3>
            <ul class="list-disc pl-5 space-y-3 text-gray-600">
              <li><strong>Answer questions</strong> after each section before you can move to the next</li>
              <li>Use the <strong>"Crunch it Down"</strong> button if you need a simplified version of the text</li>
              <li>Click <strong>"Listen to Audio"</strong> to hear the text read aloud (note: audio may have some gaps due to text-to-speech limitations)</li>
              <li>Double-click any word to see its definition</li>
            </ul>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Completing Your Assignment</h3>
            <ul class="list-disc pl-5 space-y-3 text-gray-600">
              <li>After finishing the reading, you'll be queued for the <strong>completion test</strong></li>
              <li>Complete the test within <strong>14 days</strong> of finishing the reading</li>
              <li>Your results will be available to both you and your teacher</li>
            </ul>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Important Notes</h3>
            <div class="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <ul class="list-disc pl-5 space-y-2 text-gray-700">
                <li><strong>Audio features:</strong> The text-to-speech may not always be perfect. Be prepared to see missing blocks of text or unusual pronunciations.</li>
                <li><strong>Simplification:</strong> The "Crunch it Down" feature provides a modified version of the text that may be easier to understand, but always refer to the original for complete information.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <!-- Teacher Guide Section -->
      <div v-if="activeTab === 'teacher'" class="max-w-4xl mx-auto">
        <h2 class="text-2xl font-semibold text-gray-800 mb-6 text-center">How to Use uMa as a Teacher</h2>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Getting Started</h3>
            <ol class="list-decimal pl-5 space-y-3 text-gray-600">
              <li>Go to your <strong>Teacher Dashboard</strong> after logging in</li>
              <li>Click on <strong>"Submit a Text"</strong> to add new reading material</li>
            </ol>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Creating Text Chunks</h3>
            <div class="mb-4 text-gray-600">
              <p>Divide your text into manageable chunks using XML-style tags:</p>
              <div class="mt-2 p-3 bg-gray-100 rounded-md font-mono text-sm">
                &lt;chunk&gt;This is the content of your first chunk.&lt;/chunk&gt;<br>
                &lt;chunk&gt;This is the content of your second chunk.&lt;/chunk&gt;<br>
                &lt;chunk&gt;This is the content of your third chunk.&lt;/chunk&gt;
              </div>
            </div>
            <ul class="list-disc pl-5 space-y-3 text-gray-600">
              <li>Keep each chunk reasonably short (1-3 paragraphs recommended)</li>
              <li>You can submit an entire chapter or section at once, as long as it's divided into appropriate chunks</li>
              <li>Use clear, descriptive titles that include the work name, chapter/section, and chunk number (e.g., "Alice in Wonderland, Ch 2, Chunk 1")</li>
            </ul>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Important Notes</h3>
            <div class="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <ul class="list-disc pl-5 space-y-2 text-gray-700">
                <li><strong>Audio generation:</strong> Submit texts after school hours when possible to give the server time to compile audio files.</li>
                <li><strong>Text formatting:</strong> Dashes and unusual punctuation may cause issues with audio generation. Simple punctuation works best.</li>
                <li><strong>Student progress:</strong> You can monitor which students have started and completed each text from your dashboard.</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div class="p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Best Practices</h3>
            <ul class="list-disc pl-5 space-y-3 text-gray-600">
              <li>Review the AI-generated questions for each text to ensure they align with your learning objectives</li>
              <li>Consider the reading level of your students when selecting and chunking texts</li>
              <li>Check the "Crunch it Down" version of your text to see what simplified versions your students may be using</li>
            </ul>
          </div>
        </div>
      </div>
      
      <!-- Portal Button -->
      <div class="mt-12 text-center">
        <div class="flex justify-center">
          <router-link 
            :to="{ name: activeTab === 'student' ? 'student-dashboard' : 'teacher-dashboard' }"
            class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            {{ activeTab === 'student' ? 'Go to Student Portal' : 'Go to Teacher Portal' }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// Tab state
const activeTab = ref('student')
</script>