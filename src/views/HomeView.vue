<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <h1 class="text-center text-3xl font-bold">Welcome to Student Reader</h1>
      <div class="flex justify-center space-x-4">
        <router-link 
          to="/register" 
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Register
        </router-link>
      </div>
    </div>
  </div>
</template>