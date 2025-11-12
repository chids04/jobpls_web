import { createFileRoute } from '@tanstack/react-router';

// This defines the root route '/'
export const Route = createFileRoute('/')({
  // The 'redirect' option handles the redirection
  // It will redirect any access to '/' to '/home'
  redirect: '/home', // Or a function: ({ search }) => '/home',
});