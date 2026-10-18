export const DEFAULT_CATEGORIES = [
  { id: 'development', name: 'Development', color: 'emerald', description: 'Code snippets, technical docs, APIs, and dev guides' },
  { id: 'learning', name: 'Learning', color: 'blue', description: 'Tutorials, courses, articles, and book notes' },
  { id: 'research', name: 'Research', color: 'purple', description: 'Papers, deep-dives, studies, and data reports' },
  { id: 'work', name: 'Work', color: 'amber', description: 'Project notes, meeting briefs, and professional resources' },
  { id: 'personal', name: 'Personal', color: 'rose', description: 'Personal projects, health, finances, and hobbies' },
  { id: 'ideas', name: 'Ideas', color: 'teal', description: 'Brainstorms, future project sparks, and inspirations' },
];

export const SOURCE_TYPES = [
  'Website',
  'YouTube',
  'PDF',
  'Screenshot',
  'Image',
  'Code',
  'Research Paper',
  'Chat',
  'Bookmark',
  'Other'
];

export const SOURCE_TYPE_COLORS = {
  'Website': 'bg-sky-50 text-sky-700 border-sky-200',
  'YouTube': 'bg-red-50 text-red-700 border-red-200',
  'PDF': 'bg-amber-50 text-amber-700 border-amber-200',
  'Screenshot': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  'Image': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Code': 'bg-violet-50 text-violet-700 border-violet-200',
  'Research Paper': 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  'Chat': 'bg-teal-50 text-teal-700 border-teal-200',
  'Bookmark': 'bg-blue-50 text-blue-700 border-blue-200',
  'Other': 'bg-slate-100 text-slate-700 border-slate-200',
};
