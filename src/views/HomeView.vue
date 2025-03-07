<!-- src/views/HomeView.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-b from-white to-blue-50">
    <!-- Hero Section -->
    <div class="container mx-auto px-4 py-12">
      <div class="text-center mb-16">
        <h1 class="text-4xl font-bold text-gray-900 mb-4">
          Welcome to <span class="text-blue-600">Student Reader</span>
        </h1>
        <p class="text-xl text-gray-600 max-w-2xl mx-auto">
          Your interactive reading companion that helps you understand and retain information better
          through AI-powered comprehension assistance.
        </p>
      </div>

      <!-- How It Works Section -->
      <div class="max-w-4xl mx-auto mb-16">
        <h2 class="text-2xl font-semibold text-gray-800 mb-8 text-center">How It Works</h2>
        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex justify-center mb-4">
              <Book class="w-10 h-10 text-blue-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2 text-center">1. Select Text</h3>
            <p class="text-gray-600 text-center">
              Choose from a variety of texts uploaded by your teachers
            </p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex justify-center mb-4">
              <Brain class="w-10 h-10 text-blue-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2 text-center">2. Read & Answer</h3>
            <p class="text-gray-600 text-center">
              Read passages and answer AI-generated comprehension questions
            </p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <div class="flex justify-center mb-4">
              <Award class="w-10 h-10 text-blue-600" />
            </div>
            <h3 class="text-lg font-semibold text-gray-800 mb-2 text-center">3. Complete Test</h3>
            <p class="text-gray-600 text-center">
              Take a final comprehension test to demonstrate your understanding
            </p>
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="max-w-4xl mx-auto">
        <h2 class="text-2xl font-semibold text-gray-800 mb-8 text-center">Key Features</h2>
        <div class="grid md:grid-cols-2 gap-6">
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">AI-Powered Learning</h3>
            <p class="text-gray-600">
              Get personalized feedback and hints from our AI assistant to help you understand the
              text better
            </p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Progress Tracking</h3>
            <p class="text-gray-600">
              Monitor your reading progress and comprehension improvements over time
            </p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Dictionary Lookup</h3>
            <p class="text-gray-600">
              Double-click any word while reading to instantly see its definition
            </p>
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h3 class="text-lg font-semibold text-gray-800 mb-2">Review Previous Sections</h3>
            <p class="text-gray-600">
              Easily access and review previously read sections while you progress through the text
            </p>
          </div>
        </div>
      </div>
      
      <!-- Auth Buttons -->
      <div class="mt-12 text-center">
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <router-link 
            to="/login" 
            class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign In
          </router-link>
          <router-link 
            to="/register" 
            class="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
          >
            Create Account
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Book, Brain, Award } from 'lucide-vue-next'
</script>