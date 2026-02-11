export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="max-w-2xl px-6">
        <h1 className="text-4xl font-bold mb-8">Hello World</h1>
        <h2 className="text-2xl font-semibold mb-4">Advantages of Claude Code</h2>
        <ul className="list-disc list-inside space-y-2 text-lg text-gray-700 dark:text-gray-300">
          <li>Works directly in your terminal alongside your existing workflow</li>
          <li>Understands your entire codebase with full context awareness</li>
          <li>Edits, creates, and refactors files autonomously</li>
          <li>Runs commands, tests, and builds on your behalf</li>
          <li>Supports multi-step tasks with intelligent planning</li>
          <li>Integrates with git for safe, reviewable changes</li>
          <li>No context switching between editor and AI chat</li>
        </ul>
      </div>
    </div>
  );
}
